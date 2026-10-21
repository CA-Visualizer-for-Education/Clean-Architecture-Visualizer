import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "web-tree-sitter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global in-memory cache mapping absolute file paths to their resolved dependencies.
 * Key: Absolute file path (e.g. "/path/to/LoginController.java")
 * Value: List of imported symbols actually referenced in the file (e.g. ["User"])
 */
export const dependencyCache = new Map<string, string[]>();

/**
 * Interface that each language-specific AST parser must fulfill.
 */
export interface LanguageParser {
	init(): Promise<void>;
	extractDependencies(
		sourceCode: string,
		filePath: string,
		projectRoot: string,
	): Promise<string[]>;
}

/**
 * Java AST parser implementation using Tree-sitter WASM.
 */
export class JavaLanguageParser implements LanguageParser {
	private parser: Parser | null = null;
	private javaLanguage: Parser.Language | null = null;
	private isInitialized = false;

	async init(): Promise<void> {
		if (this.isInitialized) return;

		// Resolve WASM binary location relative to current build/dist layout
		const wasmDir = path.resolve(__dirname, "../../assets/wasm");
		const treeSitterWasmPath = path.join(wasmDir, "tree-sitter.wasm");
		const javaWasmPath = path.join(wasmDir, "tree-sitter-java.wasm");

		await Parser.init({
			locateFile: () => treeSitterWasmPath,
		});

		this.parser = new Parser();
		this.javaLanguage = await Parser.Language.load(javaWasmPath);
		this.parser.setLanguage(this.javaLanguage);
		this.isInitialized = true;
	}

	async extractDependencies(
		sourceCode: string,
		_filePath: string,
		projectRoot: string,
	): Promise<string[]> {
		if (!this.parser || !this.javaLanguage) {
			throw new Error("Java AST Parser has not been initialized.");
		}

		const tree = this.parser.parse(sourceCode);
		const rootNode = tree.rootNode;

		const specificImports = new Set<string>();
		const wildcardPackages = new Set<string>();

		// 1. Traverse top-level AST nodes to find import declarations cleanly
		for (const child of rootNode.namedChildren) {
			if (child.type === "import_declaration") {
				const text = child.text;
				// Strip comments and punctuation cleanly handled by AST token boundaries
				const clean = text
					.replace(/^import\s+static\s+/, "")
					.replace(/^import\s+/, "")
					.replace(/;$/, "")
					.trim();

				if (clean.endsWith(".*")) {
					wildcardPackages.add(clean.slice(0, -2));
				} else {
					const className = clean.split(".").at(-1);
					if (className && className !== "*") {
						specificImports.add(className);
					}
				}
			}
		}

		// 2. Collect all identifier usages inside class/interface bodies (excluding imports/package headers)
		const usedSymbols = new Set<string>();
		const traverse = (node: Parser.SyntaxNode) => {
			if (node.type === "type_identifier" || node.type === "identifier") {
				usedSymbols.add(node.text);
			}
			for (const child of node.namedChildren) {
				traverse(child);
			}
		};

		for (const child of rootNode.namedChildren) {
			if (
				child.type !== "import_declaration" &&
				child.type !== "package_declaration"
			) {
				traverse(child);
			}
		}

		const validDependencies = new Set<string>();

		// 3. Match specific imports against actually used symbols
		for (const importedClass of specificImports) {
			if (usedSymbols.has(importedClass)) {
				validDependencies.add(importedClass);
			}
		}

		// 4. Resolve wildcard imports (e.g. import entity.*)
		// Scan the target package directory to discover available classes,
		// and activate only those symbols that actually appear in this file's usage.
		if (wildcardPackages.size > 0) {
			const packageClasses = this.findClassesInPackages(
				wildcardPackages,
				projectRoot,
			);
			for (const pkgClass of packageClasses) {
				if (usedSymbols.has(pkgClass)) {
					validDependencies.add(pkgClass);
				}
			}
		}

		return Array.from(validDependencies);
	}

	/**
	 * Helper to locate classes under imported package paths within the project.
	 */
	private findClassesInPackages(
		packages: Set<string>,
		projectRoot: string,
	): Set<string> {
		const classNames = new Set<string>();

		for (const pkg of packages) {
			const relativePkgDir = pkg.replace(/\./g, path.sep);
			const candidates = [
				path.join(projectRoot, relativePkgDir),
				path.join(projectRoot, "src", relativePkgDir),
			];

			for (const candidate of candidates) {
				if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
					try {
						const files = fs.readdirSync(candidate);
						for (const file of files) {
							if (file.endsWith(".java")) {
								classNames.add(file.replace(/\.java$/, ""));
							}
						}
					} catch {
						// Ignore directory read errors
					}
				}
			}
		}

		return classNames;
	}
}

/**
 * Language Registry: allows modular addition of other languages (e.g. Python, TypeScript).
 */
export const parserRegistry: Record<string, LanguageParser> = {
	".java": new JavaLanguageParser(),
};

/**
 * Recursively scans directory for source files matching registered language extensions.
 */
function scanSourceFiles(
	dirPath: string,
	supportedExts: Set<string>,
): string[] {
	const matchedFiles: string[] = [];
	const ignoredDirs = new Set([
		"node_modules",
		".git",
		"dist",
		"bin",
		"out",
		"frontend",
	]);

	function walk(current: string) {
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(current, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			if (entry.isDirectory()) {
				if (!ignoredDirs.has(entry.name) && !entry.name.startsWith(".")) {
					walk(path.join(current, entry.name));
				}
			} else if (entry.isFile()) {
				const ext = path.extname(entry.name);
				if (supportedExts.has(ext)) {
					matchedFiles.push(path.join(current, entry.name));
				}
			}
		}
	}

	walk(dirPath);
	return matchedFiles;
}

/**
 * Pre-verification task: preloads and parses all source files in the project,
 * populating dependencyCache before Clean Architecture validation starts.
 */
export async function preloadDependencies(projectRoot: string): Promise<void> {
	dependencyCache.clear();

	const supportedExtensions = new Set(Object.keys(parserRegistry));
	const filesToProcess = scanSourceFiles(projectRoot, supportedExtensions);
	if (filesToProcess.length === 0) return;

	// Initialize only the parsers required by the discovered files
	const neededParsers = new Set<LanguageParser>();
	for (const filePath of filesToProcess) {
		const ext = path.extname(filePath);
		const parser = parserRegistry[ext];
		if (parser) neededParsers.add(parser);
	}

	for (const parser of neededParsers) {
		await parser.init();
	}

	// Parse each file and store clean dependencies in cache
	for (const filePath of filesToProcess) {
		const ext = path.extname(filePath);
		const parser = parserRegistry[ext];
		if (!parser) continue;

		try {
			const sourceCode = fs.readFileSync(filePath, "utf-8");
			const dependencies = await parser.extractDependencies(
				sourceCode,
				filePath,
				projectRoot,
			);
			// Normalize path keys with forward slashes for cross-platform consistency
			const normalizedPath = filePath.replace(/\\/g, "/");
			dependencyCache.set(normalizedPath, dependencies);
		} catch (err) {
			console.warn(`[AST Preload] Failed parsing ${filePath}:`, err);
		}
	}
}

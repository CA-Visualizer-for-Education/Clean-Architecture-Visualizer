import { globalDependencyRegistry } from '../data_access/dependency-registry.js';
import { FileAccess } from '../data_access/fileAccess.js';
import { JavaLanguageParser } from './parsers/java-language-parser.js';

/**
 * Pre-verification task: preloads and parses source files in the project,
 * populating the dependency registry before Clean Architecture validation begins.
 *
 * @param projectRoot Absolute or relative path to the root of the project to analyze.
 * @param fileAccess Optional existing FileAccess instance.
 */
export async function preloadDependencies(
  projectRoot: string,
  fileAccess?: FileAccess
): Promise<void> {
  globalDependencyRegistry.clear();

  const fa = fileAccess ?? new FileAccess();
  const allProjectFiles = await fa.getAllSourceFiles(projectRoot);

  const parser = new JavaLanguageParser();
  const targetFiles = allProjectFiles.filter((filePath) =>
    parser.supportedExtensions.some((ext) => filePath.endsWith(ext))
  );

  if (targetFiles.length === 0) return;

  await parser.init();

  for (const filePath of targetFiles) {
    try {
      const sourceCode = await fa.getFileContent(filePath);
      const relationships = await parser.extractDependencies(
        sourceCode,
        filePath,
        allProjectFiles
      );
      globalDependencyRegistry.register(filePath, relationships);
    } catch (err) {
      console.warn(`[AST Preload] Failed parsing ${filePath}:`, err);
    }
  }
}

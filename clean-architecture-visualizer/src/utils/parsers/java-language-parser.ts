import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Parser from 'web-tree-sitter';
import type { LanguageParser } from '../../types/language-parser.js';
import type {
  Relationship,
  RelationshipType,
} from '../../types/relationship.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Java AST parser implementation using Tree-sitter WASM with declarative Queries.
 */
export class JavaLanguageParser implements LanguageParser {
  public readonly supportedExtensions = ['.java'] as const;

  private parser: Parser | null = null;
  private javaLanguage: Parser.Language | null = null;
  private isInitialized = false;

  private packageQuery: Parser.Query | null = null;
  private hierarchyQuery: Parser.Query | null = null;
  private importQuery: Parser.Query | null = null;
  private usedSymbolsQuery: Parser.Query | null = null;

  private isSupportedFile(file: string): boolean {
    return this.supportedExtensions.some((ext) => file.endsWith(ext));
  }

  private getClassName(file: string): string {
    return path.basename(file, path.extname(file));
  }

  /**
   * Resolves the primary base type identifier from a hierarchy type node,
   * cleanly stripping out generic type arguments (e.g. Base<T> -> Base).
   */
  private resolveBaseTypeName(node: Parser.SyntaxNode): string | undefined {
    if (node.type === 'type_identifier') {
      return node.text;
    }
    if (node.type === 'generic_type') {
      const typeNode = node.namedChildren[0];
      return typeNode ? this.resolveBaseTypeName(typeNode) : undefined;
    }
    if (node.type === 'scoped_type_identifier') {
      const classNode = node.namedChildren.at(-1);
      return classNode?.text;
    }
    return undefined;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    const wasmDir = path.resolve(__dirname, '../../../assets/wasm');
    const treeSitterWasmPath = path.join(wasmDir, 'tree-sitter.wasm');
    const javaWasmPath = path.join(wasmDir, 'tree-sitter-java.wasm');

    await Parser.init({
      locateFile: () => treeSitterWasmPath,
    });

    this.parser = new Parser();
    this.javaLanguage = await Parser.Language.load(javaWasmPath);
    this.parser.setLanguage(this.javaLanguage);

    this.packageQuery = this.javaLanguage.query(`
      (package_declaration [(identifier) (scoped_identifier)] @pkg)
    `);

    this.hierarchyQuery = this.javaLanguage.query(`
      (superclass) @extends_container
      (extends_interfaces) @extends_container
      (super_interfaces) @implements_container
    `);

    this.importQuery = this.javaLanguage.query(`
      (import_declaration (scoped_identifier) @import (asterisk)? @wildcard)
    `);

    this.usedSymbolsQuery = this.javaLanguage.query(`
      (type_identifier) @used_symbol
      (scoped_type_identifier) @used_scoped_symbol
      (identifier) @used_symbol
    `);

    this.isInitialized = true;
  }

  async extractDependencies(
    sourceCode: string,
    filePath: string,
    projectFiles: readonly string[]
  ): Promise<Relationship[]> {
    if (
      !this.parser ||
      !this.javaLanguage ||
      !this.packageQuery ||
      !this.hierarchyQuery ||
      !this.importQuery ||
      !this.usedSymbolsQuery
    ) {
      throw new Error('Java AST Parser has not been initialized.');
    }

    const tree = this.parser.parse(sourceCode);
    const rootNode = tree.rootNode;

    // 1. Extract hierarchy relationship names
    const extendsNames = new Set<string>();
    const implementsNames = new Set<string>();

    for (const capture of this.hierarchyQuery.captures(rootNode)) {
      const container = capture.node;
      const typeList =
        container.namedChildren.find((c) => c.type === 'type_list') ??
        container;

      for (const childNode of typeList.namedChildren) {
        const typeName = this.resolveBaseTypeName(childNode);
        if (!typeName) continue;

        if (capture.name === 'extends_container') {
          extendsNames.add(typeName);
        } else if (capture.name === 'implements_container') {
          implementsNames.add(typeName);
        }
      }
    }

    // 2. Assemble available symbol pool from project classes
    const availableSymbols = new Map<string, string>();
    const allKnownProjectClasses = new Set<string>();
    const currentClassName = this.getClassName(filePath);

    for (const pf of projectFiles) {
      if (this.isSupportedFile(pf)) {
        const className = this.getClassName(pf);
        allKnownProjectClasses.add(className);
        if (className !== currentClassName) {
          availableSymbols.set(className, className);
        }
      }
    }

    // 3. Extract imports (merging regular and static imports)
    const confirmedDependencies = new Set<string>();

    for (const child of rootNode.children) {
      if (child.type !== 'import_declaration') continue;

      const isStatic = child.children.some((c) => c.type === 'static');
      const isWildcard = child.children.some((c) => c.type === 'asterisk');
      const scopedId = child.children.find(
        (c) => c.type === 'scoped_identifier'
      );
      if (!scopedId) continue;

      const scopeNode = scopedId.childForFieldName('scope');
      const classNode =
        isStatic && !isWildcard
          ? (scopeNode?.childForFieldName('name') ?? scopeNode)
          : (scopedId.childForFieldName('name') ?? scopedId);

      const targetClass = classNode?.text;
      if (!targetClass) continue;

      if (isStatic && isWildcard) {
        confirmedDependencies.add(targetClass);
      } else {
        const trigger = scopedId.childForFieldName('name')?.text ?? targetClass;
        availableSymbols.set(trigger, targetClass);
      }
    }

    // 4. Cross-check used symbols in body against available symbols
    for (const capture of this.usedSymbolsQuery.captures(rootNode)) {
      let current: Parser.SyntaxNode | null = capture.node.parent;
      let isHeader = false;
      while (current) {
        if (
          current.type === 'package_declaration' ||
          current.type === 'import_declaration'
        ) {
          isHeader = true;
          break;
        }
        current = current.parent;
      }
      if (isHeader) continue;

      const symbolText =
        capture.node.type === 'scoped_type_identifier'
          ? (capture.node.namedChildren.at(-1)?.text ?? capture.node.text)
          : capture.node.text;

      const targetClass = availableSymbols.get(symbolText);
      if (targetClass && targetClass !== currentClassName) {
        confirmedDependencies.add(targetClass);
      }
    }

    // 6. Map into official Relationship records
    const resultMap = new Map<string, RelationshipType>();

    for (const name of extendsNames) {
      resultMap.set(name, 'extends');
    }

    for (const name of implementsNames) {
      if (!resultMap.has(name)) {
        resultMap.set(name, 'implements');
      }
    }

    for (const name of confirmedDependencies) {
      if (!resultMap.has(name)) {
        resultMap.set(name, 'dependency');
      }
    }

    return Array.from(resultMap.entries()).map(
      ([fileName, relationshipType]) => ({
        fileName,
        relationshipType,
      })
    );
  }
}

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
  private usedTypesQuery: Parser.Query | null = null;

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

    this.usedTypesQuery = this.javaLanguage.query(`
      (type_identifier) @used_type
      (scoped_type_identifier) @used_scoped_type
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
      !this.usedTypesQuery
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

    // 2. Extract single and wildcard imports
    const importedSingleClasses = new Set<string>();
    const importedWildcardPackages = new Set<string>();

    for (const match of this.importQuery.matches(rootNode)) {
      const isWildcard = match.captures.some((c) => c.name === 'wildcard');
      const importCapture = match.captures.find((c) => c.name === 'import');
      if (!importCapture) continue;

      if (isWildcard) {
        importedWildcardPackages.add(importCapture.node.text);
      } else {
        const classNode = importCapture.node.namedChildren.at(-1);
        importedSingleClasses.add(
          classNode ? classNode.text : importCapture.node.text
        );
      }
    }

    // 3. Extract types used within class/interface bodies
    const bodyUsedSimpleTypes = new Set<string>();
    const bodyUsedScopedNodes: Parser.SyntaxNode[] = [];

    for (const capture of this.usedTypesQuery.captures(rootNode)) {
      const parentType = capture.node.parent?.type;
      if (
        parentType === 'import_declaration' ||
        parentType === 'package_declaration'
      ) {
        continue;
      }

      if (capture.name === 'used_type') {
        bodyUsedSimpleTypes.add(capture.node.text);
      } else if (capture.name === 'used_scoped_type') {
        bodyUsedScopedNodes.push(capture.node);
      }
    }

    // 4. Assemble available symbol pool
    const availableSymbols = new Set<string>();

    for (const singleClass of importedSingleClasses) {
      availableSymbols.add(singleClass);
    }

    const allKnownProjectClasses = new Set<string>();
    const currentClassName = this.getClassName(filePath);

    for (const pf of projectFiles) {
      if (this.isSupportedFile(pf)) {
        allKnownProjectClasses.add(this.getClassName(pf));
      }
    }

    for (const projectClass of allKnownProjectClasses) {
      if (projectClass !== currentClassName) {
        availableSymbols.add(projectClass);
      }
    }

    // 5. Cross-check used types against available symbols and project classes
    const confirmedDependencies = new Set<string>();

    for (const typeName of bodyUsedSimpleTypes) {
      if (availableSymbols.has(typeName)) {
        confirmedDependencies.add(typeName);
      }
    }

    for (const scopedNode of bodyUsedScopedNodes) {
      const classNode = scopedNode.namedChildren.at(-1);
      if (classNode) {
        const className = classNode.text;
        if (allKnownProjectClasses.has(className)) {
          confirmedDependencies.add(className);
        }
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

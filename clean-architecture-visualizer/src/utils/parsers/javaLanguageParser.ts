import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Parser from 'web-tree-sitter';
import type { LanguageParser } from '../../types/languageParser.js';
import type {
  Relationship,
  RelationshipType,
} from '../../types/relationship.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Java AST parser implementation using Tree-sitter WASM.
 */
export class JavaLanguageParser implements LanguageParser {
  public readonly supportedExtensions = ['.java'] as const;

  private parser: Parser | null = null;
  private javaLanguage: Parser.Language | null = null;
  private isInitialized = false;

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
    this.isInitialized = true;
  }

  async extractDependencies(
    sourceCode: string,
    filePath: string,
    projectFiles: readonly string[]
  ): Promise<Relationship[]> {
    if (!this.parser || !this.javaLanguage) {
      throw new Error('Java AST Parser has not been initialized.');
    }

    const tree = this.parser.parse(sourceCode);
    const rootNode = tree.rootNode;

    const specificImports = new Set<string>();
    const wildcardPackages = new Set<string>();
    const extendsSet = new Set<string>();
    const implementsSet = new Set<string>();

    // 1. Traverse top-level AST declarations
    for (const child of rootNode.namedChildren) {
      if (child.type === 'import_declaration') {
        const hasAsterisk = child.namedChildren.some(
          (c) => c.type === 'asterisk'
        );
        if (hasAsterisk) {
          // Wildcard on-demand import (JLS Section 7.5.2)
          const pkgNode = child.namedChildren.find(
            (c) => c.type === 'identifier' || c.type === 'scoped_identifier'
          );
          if (pkgNode) {
            wildcardPackages.add(pkgNode.text);
          }
        } else {
          // Single-type import (JLS Section 7.5.1)
          const targetNode = child.namedChildren.find(
            (c) => c.type === 'scoped_identifier' || c.type === 'identifier'
          );
          if (targetNode) {
            const className = targetNode.text.split('.').at(-1);
            if (className) {
              specificImports.add(className);
            }
          }
        }
      }

      if (child.type === 'class_declaration') {
        for (const subChild of child.namedChildren) {
          if (subChild.type === 'superclass') {
            for (const idNode of subChild.namedChildren) {
              if (idNode.type === 'type_identifier') {
                extendsSet.add(idNode.text);
              }
            }
          }
          if (subChild.type === 'super_interfaces') {
            for (const typeList of subChild.namedChildren) {
              for (const idNode of typeList.namedChildren) {
                if (idNode.type === 'type_identifier') {
                  implementsSet.add(idNode.text);
                }
              }
              if (typeList.type === 'type_identifier') {
                implementsSet.add(typeList.text);
              }
            }
          }
        }
      }
    }

    // 2. Collect used identifiers within class/interface bodies (excluding package/import headers)
    const usedSymbols = new Set<string>();
    const traverse = (node: Parser.SyntaxNode) => {
      if (node.type === 'type_identifier' || node.type === 'identifier') {
        usedSymbols.add(node.text);
      }
      for (const nextChild of node.namedChildren) {
        traverse(nextChild);
      }
    };

    for (const child of rootNode.namedChildren) {
      if (
        child.type !== 'import_declaration' &&
        child.type !== 'package_declaration'
      ) {
        traverse(child);
      }
    }

    // 3. Resolve same-package sibling classes (JLS Section 7.4 / Section 7.5) and wildcard classes in memory
    const currentDirNormalized = path
      .dirname(filePath)
      .replace(/\\/g, '/')
      .toLowerCase();
    const currentFileName = path.basename(filePath);

    const samePackageClasses = new Set<string>();
    for (const pf of projectFiles) {
      const pfNormalized = pf.replace(/\\/g, '/');
      if (
        path.dirname(pfNormalized).toLowerCase() === currentDirNormalized &&
        path.basename(pfNormalized) !== currentFileName &&
        pfNormalized.endsWith('.java')
      ) {
        samePackageClasses.add(path.basename(pfNormalized, '.java'));
      }
    }

    const wildcardResolvedClasses = new Set<string>();
    for (const pkg of wildcardPackages) {
      const pkgPathFragment = `/${pkg.replace(/\./g, '/')}/`;
      for (const pf of projectFiles) {
        const pfNormalized = pf.replace(/\\/g, '/');
        const withLeadingSlash = pfNormalized.startsWith('/')
          ? pfNormalized
          : `/${pfNormalized}`;
        if (
          withLeadingSlash.includes(pkgPathFragment) &&
          pfNormalized.endsWith('.java')
        ) {
          wildcardResolvedClasses.add(path.basename(pfNormalized, '.java'));
        }
      }
    }

    // 4. Map to official Relationship records
    const resultMap = new Map<string, RelationshipType>();

    for (const baseClass of extendsSet) {
      resultMap.set(baseClass, 'extends');
    }

    for (const iface of implementsSet) {
      resultMap.set(iface, 'implements');
    }

    for (const importedClass of specificImports) {
      if (usedSymbols.has(importedClass) && !resultMap.has(importedClass)) {
        resultMap.set(importedClass, 'dependency');
      }
    }

    for (const siblingClass of samePackageClasses) {
      if (usedSymbols.has(siblingClass) && !resultMap.has(siblingClass)) {
        resultMap.set(siblingClass, 'dependency');
      }
    }

    for (const pkgClass of wildcardResolvedClasses) {
      if (usedSymbols.has(pkgClass) && !resultMap.has(pkgClass)) {
        resultMap.set(pkgClass, 'dependency');
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

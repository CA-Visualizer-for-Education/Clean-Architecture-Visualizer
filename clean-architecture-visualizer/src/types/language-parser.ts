import type { Relationship } from './relationship.js';

/**
 * Common interface that every language-specific AST parser must fulfill.
 */
export interface LanguageParser {
  /**
   * Supported file extensions (e.g. ['.java']).
   */
  readonly supportedExtensions: readonly string[];

  /**
   * Initializes the underlying Tree-sitter WASM grammar binary.
   */
  init(): Promise<void>;

  /**
   * Extracts clean architectural relationships from source code.
   *
   * @param sourceCode The raw content of the source file.
   * @param filePath Absolute path of the current file.
   * @param projectFiles Array of all known file paths across the project.
   */
  extractDependencies(
    sourceCode: string,
    filePath: string,
    projectFiles: readonly string[]
  ): Promise<Relationship[]>;
}

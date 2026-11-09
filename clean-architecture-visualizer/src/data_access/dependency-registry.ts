import path from 'node:path';
import type { Relationship } from '../types/relationship.js';

/**
 * In-memory dependency registry for caching parsed architectural relationships
 * across one-shot CLI verification runs, graph renderings, and unit tests.
 */
export class DependencyRegistry {
  private readonly storeByPath = new Map<string, Relationship[]>();
  private readonly storeByClass = new Map<string, Relationship[]>();

  /**
   * Registers extracted relationships for a specific file path.
   * Also indexes by base class name for fast, path-independent lookup.
   */
  public register(filePath: string, relationships: Relationship[]): void {
    const normalized = filePath.replace(/\\/g, '/');
    this.storeByPath.set(normalized, relationships);

    const baseName = path.basename(normalized, path.extname(normalized));
    if (baseName) {
      this.storeByClass.set(baseName, relationships);
    }
  }

  /**
   * Retrieves recorded relationships by absolute path, relative path,
   * or simple class name (e.g. 'LoginController' or 'LoginController.java').
   */
  public get(key: string): readonly Relationship[] | undefined {
    const normalized = key.replace(/\\/g, '/');
    if (this.storeByPath.has(normalized)) {
      return this.storeByPath.get(normalized);
    }

    const baseName = path.basename(normalized, path.extname(normalized));
    if (this.storeByClass.has(baseName)) {
      return this.storeByClass.get(baseName);
    }

    return undefined;
  }

  /**
   * Exports the entire recorded dependency graph across all registered files.
   * Useful for diagram generation and project-wide architecture verification.
   */
  public getAll(): ReadonlyMap<string, readonly Relationship[]> {
    return this.storeByClass;
  }

  /**
   * Checks whether dependencies have already been registered for the file or class.
   */
  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Clears the registry store.
   */
  public clear(): void {
    this.storeByPath.clear();
    this.storeByClass.clear();
  }
}

/**
 * Global singleton instance used across CLI execution.
 */
export const globalDependencyRegistry = new DependencyRegistry();

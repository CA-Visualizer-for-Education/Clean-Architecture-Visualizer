import type { Relationship } from '../types/relationship.js';

/**
 * In-memory dependency registry for caching parsed architectural relationships
 * across one-shot CLI verification runs.
 */
export class DependencyRegistry {
  private readonly store = new Map<string, Relationship[]>();

  /**
   * Registers extracted relationships for a specific file path.
   */
  public register(filePath: string, relationships: Relationship[]): void {
    const normalized = filePath.replace(/\\/g, '/');
    this.store.set(normalized, relationships);
  }

  /**
   * Retrieves recorded relationships for a given file path.
   */
  public get(filePath: string): readonly Relationship[] | undefined {
    const normalized = filePath.replace(/\\/g, '/');
    return this.store.get(normalized);
  }

  /**
   * Checks whether dependencies have already been registered for the file.
   */
  public has(filePath: string): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    return this.store.has(normalized);
  }

  /**
   * Clears the registry store.
   */
  public clear(): void {
    this.store.clear();
  }
}

/**
 * Global singleton instance used across CLI execution.
 */
export const globalDependencyRegistry = new DependencyRegistry();

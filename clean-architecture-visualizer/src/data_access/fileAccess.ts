import fs from 'fs/promises';
import path from 'path';

import type { FileAccessInterface } from './fileAccessInterface.js';

export class FileAccess implements FileAccessInterface {
  /**
   * Find the use case folder and collect the name of each use case.
   *  We first check if we are packaging by module by trying to find the features directory.
   *  If it exists, we assume we are packaging by module. Otherwise, we are packaging by layer.
   * @returns A list of the names of each use case.
   */
  async getUseCases(): Promise<string[]> {
    const currPath = process.cwd();

    const srcPath = await this.bfsFindDir(currPath, 'src');
    if (!srcPath) return [];

    const featuresPath = await this.bfsFindDir(currPath, 'features');
    if (featuresPath) {
      // Extract all of the features in the features directory
      const allFeatures = await fs.readdir(featuresPath, {
        withFileTypes: true,
      });
      const allFeaturePaths = allFeatures
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .map((featureName) => path.join(featuresPath, featureName));
      const allFeatureContents = await Promise.all(
        allFeaturePaths.map(
          async (featurePath) =>
            await fs.readdir(featurePath, { withFileTypes: true })
        )
      );
      return allFeatureContents
        .flat()
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
    }

    const useCasePath = await this.bfsFindDir(srcPath, 'use_case');
    if (!useCasePath) return [];

    const useCases = await fs.readdir(useCasePath, {
      withFileTypes: true,
    });

    return useCases.filter((e) => e.isDirectory()).map((e) => e.name);
  }

  /**
   * Get the file paths of each file under the directory node.
   * @param node an expected directory type.
   * @param paths a map that takes file names to their relative paths.
   */
  async getFilePaths(node: string, paths: Map<string, string>): Promise<void> {
    const currPath = process.cwd();
    const srcPath = await this.bfsFindDir(currPath, 'src');

    if (!srcPath) {
      return;
    }

    const target = await this.bfsFindDir(srcPath, node); // was path.join + stat
    if (!target) {
      console.log(`Directory ${node} not found`);
      return;
    }

    await this.collectFiles(target, paths);
  }

  /**
   * Recursively collect all files, on encountering a directory, enter it and continue
   * collecting files.
   * @param dir the path leading to the current directory.
   * @param paths a map that takes file names to their relative paths.
   */
  private async collectFiles(
    dir: string,
    paths: Map<string, string>
  ): Promise<void> {
    const files = await fs.readdir(dir, {
      withFileTypes: true,
    });

    for (const entry of files) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isFile()) {
        paths.set(entry.name, fullPath);
      } else if (entry.isDirectory()) {
        await this.collectFiles(fullPath, paths);
      }
    }
  }

  /**
   * Find the highest target directory starting from the current directory.
   * @param curr is your current working directory path.
   * @returns the path to highest in depth src directory.
   */
  private static readonly ignoredDirNames = new Set(['node_modules', '.git']);

  async bfsFindDir(curr: string, target: string): Promise<string | null> {
    const queue: string[] = [curr];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentPath = queue.shift()!;

      if (visited.has(currentPath)) continue;
      visited.add(currentPath);

      let entries;
      try {
        entries = await fs.readdir(currentPath, { withFileTypes: true });
      } catch {
        // Directory may be permission-restricted (e.g. ~/.Trash) or removed mid-scan; skip it.
        continue;
      }

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (FileAccess.ignoredDirNames.has(entry.name)) continue;
        if (entry.name.startsWith('.')) continue;

        const fullPath = path.join(currentPath, entry.name);

        if (entry.name === target) {
          return fullPath;
        }

        queue.push(fullPath);
      }
    }

    return null;
  }

  /**
   * Find the path to the targeted directory.
   * @param curr the path to the current directory (starting location).
   * @param target the name of the target directory (ending location).
   * @returns A list of the directories found within the target directory.
   */
  async findDirectory(curr: string, target: string): Promise<string | null> {
    const entries = await fs.readdir(curr, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const fullPath = path.join(curr, entry.name);

      if (entry.name === target) {
        return fullPath;
      }

      const found = await this.findDirectory(fullPath, target);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Read the imports of the file that path points to and return a list of module names.
   * Collects normal imports first before collecting package imports.
   * @param filePath is a path to a valid file.
   */
  async getFileImports(filePath: string): Promise<string[]> {
    const result: string[] = [];

    try {
      const fileContent: string = await fs.readFile(filePath, {
        encoding: 'utf-8',
      });
      const fileLines = fileContent.split('\n');

      // package is always the first non-empty line (Package Imports in Java only)
      let packageSet: Set<string> | null = null;
      for (const line of fileLines) {
        const trimmed_line = line.trim();
        if (trimmed_line === '') continue;
        if (trimmed_line.startsWith('package ')) {
          const packageDir = filePath.substring(
            0,
            filePath.lastIndexOf('/') + 1
          ); // package dir is always one dir above filepath
          const files = await fs.readdir(packageDir);
          packageSet = new Set<string>();
          const currentFileName = filePath.split('/').at(-1) ?? '';
          for (const file of files) {
            if (file !== currentFileName) {
              packageSet.add(file.replace(/\.[^.]+$/, '')); // replaces everything after the dot so fileAccess.ts -> fileAccess
            }
          }
        }
        break;
      }
      for (const line of fileLines) {
        if (
          line.startsWith('import ') ||
          line.startsWith('from ') ||
          line.startsWith('import{')
        ) {
          const trimmed_line = line.trim();
          const lastSpace = trimmed_line.lastIndexOf(' ');
          result.push(trimmed_line.substring(lastSpace + 1));
        }
      }
      // If package detected, with files other than the current file, then iterate through entire file
      if (packageSet) {
        const packageImports = this.getPackageImports(fileLines, packageSet);
        result.push(...packageImports); // pushed depenedency files are stripped of extra details, pushes LoginInputData not '"LoginInputData";'
      }
    } catch {
      console.log('The file: ' + filePath + ' could not be found');
      return [];
    }
    return result;
  }

  /**
   * Scan file lines for usages of sibling class names from the same package.
   * @param fileLines the lines of the file to scan.
   * @param packageSet set of class names (without extension) in the same package.
   * @returns list of class names from the package that are used in the file.
   */
  private getPackageImports(
    fileLines: string[],
    packageSet: Set<string>
  ): string[] {
    const found = new Set<string>();
    for (const line of fileLines) {
      const trimmed_line = line.trim();
      if (
        trimmed_line.startsWith('import ') ||
        trimmed_line.startsWith('package ') ||
        trimmed_line === ''
      ) {
        continue;
      }
      for (const className of packageSet) {
        if (!found.has(className) && trimmed_line.includes(className)) {
          found.add(className);
        }
      }
      if (found.size === packageSet.size) break;
    }
    return [...found];
  }

  /**
   * Get the project name, this is either the directory BEFORE "src", or if the
   * process is running in a directory ABOVE "src" we assume that we are in the
   * project directory.
   * @returns a string representing the project name.
   */
  async getProjectName(): Promise<string> {
    const currPath = process.cwd();
    const parts = currPath.split(path.sep);
    const srcIndex = parts.indexOf('src');
    if (srcIndex === -1) return parts[parts.length - 1]; // current dir
    return parts[srcIndex - 1];
  }

  /**
   * Get the file content of path as a single string.
   * @param filePath is a path to a valid file
   * @returns
   */
  async getFileContent(filePath: string): Promise<string> {
    try {
      const fileContent: string = await fs.readFile(filePath, {
        encoding: 'utf-8',
      });
      return fileContent;
    } catch {
      console.log('The file: ' + filePath + ' could not be found');
      return '';
    }
  }

  /**
   * Find the first import line in a file that references the given target name,
   * and return it as a snippet string.
   * @param filePath is a path to a valid file.
   * @param target the name of the imported module to search for (e.g. "Database").
   * @returns the matching import line, or undefined if not found.
   */
  async getFileSnippet(
    filePath: string,
    target: string
  ): Promise<string | undefined> {
    const content = await this.getFileContent(filePath);
    if (!content) return undefined;

    const lines = content.split('\n');
    const importLines = lines.filter((line) =>
      line.trimStart().startsWith('import ')
    );

    if (!target) {
      // No target specified — return all import lines joined
      return importLines.length > 0 ? importLines.join('\n') : undefined;
    }

    // The getFileSnippet function is only called by the getViolationsInteractor which only ever passes in cleanNode
    // If the cleanNode is "entities", we will also allow for "entity"
    const match = importLines.find(
      (line) =>
        line.toLowerCase().includes(target.toLowerCase()) ||
        (target.toLowerCase() === 'entities' &&
          line.toLowerCase().includes('entity')) ||
        (target.toLowerCase() === 'usecaseinteractor' &&
          line.toLowerCase().includes('interactor'))
    );

    return match?.trim() ?? undefined;
  }

  /**
   * Find the 1-based line number of the first import line in a file that
   * references the given target name.
   * @param filePath is a path to a valid file.
   * @param target the name of the imported module to search for (e.g. "Database").
   * @returns the 1-based line number, or undefined if not found.
   */
  async getLineNumber(
    filePath: string,
    target: string
  ): Promise<number | undefined> {
    const content = await this.getFileContent(filePath);
    if (!content) return undefined;

    const lines = content.split('\n');

    // The getLineNumber function is only called by the getViolationsInteractor which only ever passes in cleanNode
    // If the cleanNode is "entities", we will also allow for "entity"
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.trimStart().startsWith('import ') &&
        (line.toLowerCase().includes(target.toLowerCase()) ||
          (target.toLowerCase() === 'entities' &&
            line.toLowerCase().includes('entity')) ||
          (target.toLowerCase() === 'usecaseinteractor' &&
            line.toLowerCase().includes('interactor')))
      ) {
        return i + 1; // 1-based line number
      }
    }

    return undefined;
  }

  /**
   * Check whether a file/directory at path exists or not.
   * @param path the path of the file to be checked
   */
  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a directory and all nested parent directories if they don't exist.
   * @param dirPath the path of the directory (and any nested dirs) to create.
   */
  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      console.log(`Failed to create directory at ${dirPath}: ${err}`);
    }
  }

  /**
   * Create a file.
   * @param dirPath the path of the directory (and any nested dirs) to create.
   */
  async createFile(filePath: string, content: string = ''): Promise<void> {
    try {
      await fs.writeFile(filePath, content, { encoding: 'utf-8', flag: 'wx' });
    } catch (err) {
      console.log(`Failed to create file at ${filePath}: ${err}`);
    }
  }

  /**
   * Get the current working directory path.
   * @returns a string representing the current working directory path.
   */
  async getCurrentPath(): Promise<string> {
    return process.cwd();
  }
}

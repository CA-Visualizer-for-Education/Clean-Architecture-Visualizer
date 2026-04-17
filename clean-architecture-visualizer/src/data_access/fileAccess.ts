import fs from 'fs/promises';
import path from 'path';

import type { FileAccessInterface } from "./fileAccessInterface.js";

export class FileAccess implements FileAccessInterface {

    /**
     * Find the use case folder and collect the name of each use case.
     * @returns A list of the names of each use case.
     */
    async getUseCases(): Promise<string[]> {
        const currPath = process.cwd();

        const srcPath = await this.bfsFindDir(currPath, "src");
        if (!srcPath) return [];
        const useCasePath = await this.findDirectory(srcPath, "use_case");
        if (!useCasePath) return [];

        const useCases = await fs.readdir(useCasePath, {
            withFileTypes: true,
        });

        return useCases.filter(e => e.isDirectory()).map(e => e.name);
    }

    /**
     * Get the file paths of each file under the directory node.
     * @param node an expected directory type.
     * @param paths a map that takes file names to their relative paths.
     */
    async getFilePaths(node: string, paths: Map<string, string>): Promise<void> {
        const currPath = process.cwd();
        const srcPath = await this.bfsFindDir(currPath, "src");

        if (!srcPath) {
            return;
        }

        const target = path.join(srcPath, node);
        
        try {
            const stat = await fs.stat(target);
            if (stat.isDirectory()) {
                await this.collectFiles(target, paths);
            }
        } catch {
            console.log(`Directory ${node} not found`);
        }
    }

    /**
     * Recursively collect all files, on encountering a directory, enter it and continue
     * collecting files.
     * @param dir the path leading to the current directory.
     * @param paths a map that takes file names to their relative paths.
     */
    private async collectFiles(dir: string, paths: Map<string, string>): Promise<void> {
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
    async bfsFindDir(curr: string, target: string): Promise<string | null> {
        const queue: string[] = [curr];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const currentPath = queue.shift()!;
            
            if (visited.has(currentPath)) continue;
            visited.add(currentPath);

            const entries = await fs.readdir(currentPath, { withFileTypes: true });

            for (const entry of entries) {
                if (!entry.isDirectory()) continue;

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
    async findDirectory(
    curr: string,
    target: string
    ): Promise<string | null> {
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
     * @param filePath is a path to a valid file.
     */
    async getFileImports(filePath: string): Promise<string[]> {
        let result: string[] = [];

        try {
            const fileContent: string = await fs.readFile(filePath, { encoding: 'utf-8' });
            const fileLines = fileContent.split("\n");
            fileLines.forEach(line => {
                if (line.startsWith("import ")) {
                    line = line.trim();
                    const lastSpace = line.lastIndexOf(" ");
                    result.push(line.substring(lastSpace + 1));
                }
            });
        }
        catch {
            console.log("The file: " + filePath + " could not be found");
            return [];
        }

        return result;
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
        const srcIndex = parts.indexOf("src");
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
            const fileContent: string = await fs.readFile(filePath, { encoding: 'utf-8' });
            return fileContent;
        }
        catch {
            console.log("The file: " + filePath + " could not be found");
            return "";
        }
    }

    /**
     * Find the first import line in a file that references the given target name,
     * and return it as a snippet string.
     * @param filePath is a path to a valid file.
     * @param target the name of the imported module to search for (e.g. "Database").
     * @returns the matching import line, or undefined if not found.
     */
    async getFileSnippet(filePath: string, target: string): Promise<string | undefined> {
        const content = await this.getFileContent(filePath);
        if (!content) return undefined;
 
        const lines = content.split("\n");
        const importLines = lines.filter(line => line.trimStart().startsWith("import "));
 
        if (!target) {
            // No target specified — return all import lines joined
            return importLines.length > 0 ? importLines.join("\n") : undefined;
        }
 
        const match = importLines.find(line =>
            line.toLowerCase().includes(target.toLowerCase())
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
    async getLineNumber(filePath: string, target: string): Promise<number | undefined> {
        const content = await this.getFileContent(filePath);
        if (!content) return undefined;
 
        const lines = content.split("\n");
 
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trimStart().startsWith("import ") && line.toLowerCase().includes(target.toLowerCase())) {
                return i + 1; // 1-based line number
            }
        }
 
        return undefined;
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
    async createFile(filePath: string, content: string = ""): Promise<void> {
        try {
            await fs.writeFile(filePath, content, { encoding: "utf-8", flag: "wx" });
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

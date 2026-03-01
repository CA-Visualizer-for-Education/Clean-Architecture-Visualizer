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

        const srcPath = await this.bfsFindSrc(currPath);
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
        const srcPath = await this.bfsFindSrc(currPath);

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
            const fullPath = dir + "/" + entry.name;

            if (entry.isFile()) {
                paths.set(entry.name, fullPath);
            } else if (entry.isDirectory()) {
                await this.collectFiles(fullPath, paths);
            }
        }
    }

    /**
     * Find the highest src file starting from the current directory.
     * @param curr is your current working directory path.
     * @returns the path to highest in depth src directory.
     */
    async bfsFindSrc(curr: string): Promise<string | null> {
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

                if (entry.name === 'src') {
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
     * @param path is a path to a valid file.
     */
    async getFileImports(path: string): Promise<string[]> {
        let result: string[] = [];

        try {
            const fileContent: string = await fs.readFile(path, { encoding: 'utf-8' });
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
            console.log("The file: " + path + " could not be found");
            return [];
        }

        return result;
    }
}

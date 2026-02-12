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
        const useCasePath = await this.findDirectory(currPath, "use_cases");

        if (!useCasePath) {
            return [];
        }

        const useCases = await fs.readdir(useCasePath, {
            withFileTypes: true,
        });

        return useCases.filter(e => e.isDirectory()).map(e => e.name);
    }

    async getFilePaths(node: string, paths: Map<string, string>): Promise<void> {
        const currPath = process.cwd();
        const target = await this.findDirectory(currPath, node);

        if (!target) {
            return;
        }

        const files = await fs.readdir(target, {
            withFileTypes: true,
        });

        const fileList = files.filter(e => e.isFile()).map(e => e.name);

        fileList.forEach(element => {
            paths.set(element, target + "/" + element);
        });
    }

    /**
     * Find the path to the use case directory.
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
            const javaImportRegex = /^import\s+(?:static\s+)?([^;]+);/gm;

            let match;
            while((match = javaImportRegex.exec(fileContent)) !== null) {
                const[, importPath] = match;
                if(importPath){
                    result.push(importPath.trim());
                }
            }
        }
        catch {
            console.log("The file: " + path + " could not be found");
            return [];
        }

        return result;
    }
}

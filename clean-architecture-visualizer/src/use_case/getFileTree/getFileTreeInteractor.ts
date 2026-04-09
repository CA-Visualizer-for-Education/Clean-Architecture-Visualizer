import type { GetFileTreeInputBoundary } from "./getFileTreeInputBoundary.js";
import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { GetFileTreeOutputData } from "./getFileTreeOuptutData.js";
import type { FileTreeNode } from "../../types/fileTreeNode.js";
import type { FileStorage } from "../../types/sessionData.js";
import { sep } from 'path';

export class GetFileTreeInteractor implements GetFileTreeInputBoundary {
 
    constructor(
        private readonly db: SessionDBAccessInterface,
        private readonly outputData: GetFileTreeOutputData
    ) {}
 
    async getFileTree(): Promise<void> {
 
        const files = this.db.getAllFiles();
 
        const root: FileTreeNode = {
            id: "src",
            name: "src",
            type: "directory",
            path: "src/",
            children: []
        };
 
        for (const file of files) {
 
            // start each file's path from src
            const srcIndex = file.filePath.indexOf("src");
            const normalizedPath = file.filePath.slice(srcIndex);
            const parts = normalizedPath.split("/");
            const fileName = parts.at(-1) ?? file.filePath;
 
            this.insertIntoTree(root, parts, fileName, file.filePath, file.layer, file.node);
        }
 
        this.outputData.setOutputData(root);
    }
 
    private insertIntoTree(
        root: FileTreeNode,
        parts: string[],
        fileName: string,
        fullPath: string,
        layer: FileStorage["layer"],
        node: FileStorage["node"]
    ): void {
 
        let current = root;
 
        for (let i = 1; i < parts.length - 1; i++) {
 
            const dirName = parts[i];
            const dirPath = parts.slice(0, i + 1).join(sep) + sep;
 
            let next = current.children?.find(
                child => child.type === "directory" && child.name === dirName
            );
 
            if (!next) {
                next = {
                    id: dirPath,
                    name: dirName,
                    type: "directory",
                    path: dirPath,
                    layer,
                    children: []
                };
 
                current.children!.push(next);
            }
 
            current = next;
        }
 
        current.children!.push({
            id: fullPath,
            name: fileName,
            type: "file",
            path: fullPath,
            hasViolation: this.fileHasViolation(node)
        });
    }
 
    private fileHasViolation(node: FileStorage["node"]): boolean {
 
        const useCases = this.db.getAllUseCases();
 
        return useCases.some(uc =>
            uc.violationEdges.some(([from, to]) => from === node || to === node)
        );
    }
}
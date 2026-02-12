import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { ValidOutNeighbourAccessInterface } from "../../data_access/validOutNeighbourAccessInterface.js";
import type { GraphVerificationInputBoundary } from "./graphVerificationInputBoundary.js";
import type { cleanNode } from "../../entities/types/cleanNode.js";

import { useCaseGraph } from "../../entities/useCaseGraph.js";

export class GraphVerificationInteractor implements GraphVerificationInputBoundary{
    private readonly _useCaseList: useCaseGraph[] = [];
    private readonly _internalDirectories = [
        "entities",
        "use_case",
        "interface_adapters",
    ];
    private readonly _externalDirectories = [
        "views",
        "data_access",
        "database",
    ]
    
    // Paths are defined as <File Name, File Path>
    private readonly _internalFilePaths = new Map<string, string>();
    private readonly _externalFilePaths = new Map<string, string>();

    constructor(
        private readonly _fileAccess: FileAccessInterface,
        private readonly _validOutNeighbourAccess: ValidOutNeighbourAccessInterface
    ) {}

    async execute(): Promise<void> {
        await this._buildFilePaths();
        await this._buildUseCaseGraphs();
        await this._developOutNeighbours();
        await this._verifyOutNeighbours();
    }

    private async _buildFilePaths(): Promise<void> {
        Promise.all([
            ...this._internalDirectories.map(dir => this._fileAccess.getFilePaths(dir, this._internalFilePaths)),
            ...this._externalDirectories.map(dir => this._fileAccess.getFilePaths(dir, this._externalFilePaths))
        ]);
    }

    private async _buildUseCaseGraphs(): Promise<void> {
        const useCases = await this._fileAccess.getUseCases();

        for (const useCase of useCases) {
            const graph = new useCaseGraph(useCase);
            for (const [fileName, filePath] of this._internalFilePaths) {
                if (filePath.toLowerCase().includes(useCase.toLowerCase())) {
                    graph.addFile(fileName, filePath);
                }
            }
            this._useCaseList.push(graph);
        }
    }

    /**
     * Build the outneighbourmaps in each use case using the information from the 
     * paths.
     */
    private async _developOutNeighbours(): Promise<void> {
        
        for (const graph of this._useCaseList) {
            for (const [, filePath] of graph.getFiles()) {
                const fromLayer = this.resolveLayer(filePath);
                if (!fromLayer) continue;

                const imports = await this._fileAccess.getFileImports(filePath);

                for (const importPath of imports) {
                    const toLayer = this.resolveImportToLayer(importPath);
                    if (toLayer) {
                        graph.setNodeNeighbour(fromLayer, toLayer);
                    }
                }
            }
        }

        for (const [, filePath] of this._externalFilePaths) {
            const fromLayer = this.resolveLayer(filePath);
            if (!fromLayer) continue;

            const imports = await this._fileAccess.getFileImports(filePath);

            for (const importPath of imports) {
                // Find which use case owns the file being imported
                for (const graph of this._useCaseList) {
                    for (const [targetFileName] of graph.getFiles()) {
                        if (importPath.toLowerCase().includes(targetFileName.toLowerCase().replace(".java", ""))) {
                            const toLayer = this.resolveLayer(
                                graph.getFiles().get(targetFileName)!
                            );
                            if (toLayer) {
                                graph.setNodeNeighbour(fromLayer, toLayer);
                            }
                        }
                    }
                }
            }
        }
    }   

    private resolveLayer(importPath: string): cleanNode | null {
        importPath = importPath.toLowerCase();
        if (importPath.includes("viewmodel")) return "viewModel";
        if (importPath.includes("view")) return "view";
        if (importPath.includes("database")) return "database";
        if (importPath.includes("entities")) return "entities";
        if (importPath.includes("accessinterface")) return "dataAccessInterface";
        if (importPath.includes("access")) return "dataAccess";
        if (importPath.includes("controller")) return "controller";
        if (importPath.includes("presenter")) return "presenter";
        if (importPath.includes("inputboundary")) return "inputBoundary";
        if (importPath.includes("inputdata")) return "inputData";
        if (importPath.includes("outputboundary")) return "outputBoundary";
        if (importPath.includes("outputdata")) return "outputData";
        if (importPath.includes("interactor")) return "useCaseInteractor";
        return null;
    }

    private resolveImportToLayer(importPath: string): cleanNode | null {
        for (const [fileName, filePath] of this._internalFilePaths) {
            const fileType = fileName.toLowerCase().replace(/\.[^.]+$/, "");
            if (importPath.toLowerCase().includes(fileType)) {
                return this.resolveLayer(filePath);
            }
        }
        return null;
    }

    private async _verifyOutNeighbours(): Promise<void> {
        const validMap = await this._validOutNeighbourAccess.getValidOutNeighbours();

        for (const graph of this._useCaseList) {
            for (const node of Object.keys(validMap) as cleanNode[]) {
                const actualNeighbours = graph.getNodeNeighbours(node);
                const validNeighbours = validMap[node];

                for (const neighbour of actualNeighbours) {
                    if (!validNeighbours.includes(neighbour)) {
                        graph.recordViolation([node, neighbour]);
                    }
                }
            }
        }
    }
}

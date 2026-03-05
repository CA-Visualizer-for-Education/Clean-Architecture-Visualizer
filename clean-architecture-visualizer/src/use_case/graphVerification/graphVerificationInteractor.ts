import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { CleanArchInfoAccessInterface } from "../../data_access/cleanArchInfoAccessInterface.js";
import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { GraphVerificationInputBoundary } from "./graphVerificationInputBoundary.js";
import type { cleanNode } from "../../types/cleanNode.js";

import { useCaseGraph } from "../../entities/useCaseGraph.js";

export class GraphVerificationInteractor implements GraphVerificationInputBoundary{
    private readonly internalDirectories = [
        "use_case",
        "interface_adapter",
    ];
    private readonly externalDirectories = [
        "entities",
        "views",
        "data_access",
        "database",
    ]
    
    // Paths are defined as <File Name, File Path>
    private readonly internalFilePaths = new Map<string, string>();
    private readonly externalFilePaths = new Map<string, string>();

    constructor(
        private readonly fileAccess: FileAccessInterface,
        private readonly cleanArchInfoAccess: CleanArchInfoAccessInterface,
        private readonly db: SessionDBAccessInterface,
        private readonly useCaseGraphList: useCaseGraph[] = []
    ) {}

    async execute(): Promise<void> {
        await this.buildFilePaths();
        await this.buildUseCaseGraphs();
        await this.developOutNeighbours();
        await this.verifyOutNeighbours();
        this.populateDatabase();
    }

    /**
     * Build the file paths for internal and external directories. With keys representing file names and 
     * values being their respective file paths.
     */
    private async buildFilePaths(): Promise<void> {
        await Promise.all([
            ...this.internalDirectories.map(dir => this.fileAccess.getFilePaths(dir, this.internalFilePaths)),
            ...this.externalDirectories.map(dir => this.fileAccess.getFilePaths(dir, this.externalFilePaths))
        ]);
    }

    /**
     * Create a useCaseGraph for each use case, and assign files to that use case.
     */
    private async buildUseCaseGraphs(): Promise<void> {
        const useCases = await this.fileAccess.getUseCases();
        for (const useCase of useCases) {
            const graph = new useCaseGraph(useCase);
            for (const [fileName, filePath] of this.internalFilePaths) {
                if (filePath.toLowerCase().includes(useCase.toLowerCase())) {
                    graph.addFile(fileName, filePath);
                }
            }
            this.useCaseGraphList.push(graph);
        }
    }

    /**
     * Build the outneighbourmaps in each use case using the information from the 
     * paths.
     */
    private async developOutNeighbours(): Promise<void> {
        
        for (const graph of this.useCaseGraphList) {
            for (const [, filePath] of graph.getFiles()) {
                const fromLayer = this.resolveLayer(filePath);
                if (!fromLayer) continue;
                const imports = await this.fileAccess.getFileImports(filePath);
                for (const importPath of imports) {
                    const toLayer = this.resolveImportToLayer(this.internalFilePaths, importPath) ?? this.resolveImportToLayer(this.externalFilePaths, importPath);
                    if (toLayer) {
                        graph.setNodeNeighbour(fromLayer, toLayer);
                    }
                }
            }
        }

        for (const [, filePath] of this.externalFilePaths) {
            const fromLayer = this.resolveLayer(filePath);
            if (!fromLayer) continue;
            const imports = await this.fileAccess.getFileImports(filePath);

            for (const importPath of imports) {
                // Find which use case owns the file being imported
                for (const graph of this.useCaseGraphList) {
                    for (const [targetFileName] of graph.getFiles()) {
                        if (importPath.toLowerCase().includes(targetFileName.toLowerCase())) {
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

    /**
     * Given an import path, decide which node this file belongs to.
     * @param importPath the path to a file.
     * @returns 
     */
    private resolveLayer(importPath: string): cleanNode | null {
        importPath = importPath.toLowerCase();
        if (importPath.includes("viewmodel")) return "viewModel"; // must be verified before 'view'
        if (importPath.includes("view")) return "view";
        if (importPath.includes("database")) return "database";
        if (importPath.includes("entities")) return "entities";
        if (importPath.includes("accessinterface")) return "dataAccessInterface"; // must be verified before 'dataAccess'
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

    /**
     * For each import of a file, determine its what node it belongs to.
     * @param nodeType a map from file name to file path.
     * @param importPath a file path
     * @returns the node that an imported file belongs to.
     */
    private resolveImportToLayer(nodeType: Map<string, string>, importPath: string): cleanNode | null {
        const entries = [...nodeType.entries()].sort((a, b) => b[0].length - a[0].length);
        for (const [fileName, filePath] of entries) {
            const fileType = fileName.toLowerCase().replace(/\.[^.]+$/, "");
            if (!fileType) continue;
            if (importPath.toLowerCase().includes(fileType)) {
                return this.resolveLayer(filePath);
            }
        }
        return null;
    }

    /**
     * Verify that a usecase's outneighbours are allowed by Clean Architecture.
     */
    private async verifyOutNeighbours(): Promise<void> {
        const validMap = await this.cleanArchInfoAccess.getValidOutNeighbours();

        for (const graph of this.useCaseGraphList) {
            for (const node of Object.keys(validMap) as cleanNode[]) {
                const actualNeighbours = graph.getNodeNeighbours(node);
                const validNeighbours = validMap[node];

                for (const neighbour of actualNeighbours) {
                    if (!validNeighbours.includes(neighbour)) {
                        graph.setViolation([node, neighbour]);
                    }
                }
            }
        }
    }

    private populateDatabase(): void {
        const totalUseCases = this.useCaseGraphList.length;
        let violationCount = 0;

        this.useCaseGraphList.forEach(useCase => {
            violationCount += useCase.getViolationCount();
        });

        this.db.setNumUseCases(totalUseCases);
        this.db.setNumViolations(violationCount);
        this.db.setUseCases(this.useCaseGraphList);
    }
}

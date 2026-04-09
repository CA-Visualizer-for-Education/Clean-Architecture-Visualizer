import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { CleanArchInfoAccessInterface } from "../../data_access/cleanArchInfoAccessInterface.js";
import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { GraphVerificationInputBoundary } from "./graphVerificationInputBoundary.js";
import type { cleanNode } from "../../types/cleanNode.js";
import { useCaseGraph } from "../../entities/useCaseGraph.js";
import type { EdgeStorage, FileStorage, NodeStorage } from "../../types/sessionData.js";
import type { cleanLayer } from "../../types/cleanLayer.js";
import { GraphVerificationOutputData } from "./graphVerificationOutputData.js";

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

    // The node of files <File Name, Node>
    private readonly externalNodes : Record<string, cleanNode> = {};

    private toCommandLine: boolean = false;
    private outputData: GraphVerificationOutputData;

    constructor(
        private readonly fileAccess: FileAccessInterface,
        private readonly cleanArchInfoAccess: CleanArchInfoAccessInterface,
        private readonly db: SessionDBAccessInterface,
         private readonly useCaseGraphList: useCaseGraph[] = [],
        outputData: GraphVerificationOutputData = new GraphVerificationOutputData(),
    ) {
        this.outputData = outputData;
    }

    async execute(): Promise<void> {
        await this.buildFilePaths();
        await this.buildUseCaseGraphs();
        await this.developOutNeighbours();
        await this.verifyOutNeighbours();
        await this.populateDatabase();
        if (this.toCommandLine) {
            this.prepareOutput();
        }
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
            for (const [fileName, filePath] of graph.getFiles()) {
                const fromNode = this.resolveNode(filePath);
                if (!fromNode) continue;
                this.externalNodes[fileName] = fromNode;
                const imports = await this.fileAccess.getFileImports(filePath);
                for (const importPath of imports) {
                    const toNode = this.resolveImportToNode(this.internalFilePaths, importPath) ?? this.resolveImportToNode(this.externalFilePaths, importPath);
                    if (toNode) {
                        graph.setNodeNeighbour(fromNode, toNode);
                    }
                }
            }
        }

        for (const [fileName, filePath] of this.externalFilePaths) {
            const fromNode = this.resolveNode(filePath);
            if (!fromNode) continue;
            this.externalNodes[fileName] = fromNode;
            const imports = await this.fileAccess.getFileImports(filePath);

            // Find all graphs that own any (.some functionality) of this file's imports
            const owningGraphs = this.useCaseGraphList.filter(graph =>
                imports.some(importPath =>
                    [...graph.getFiles().keys()].some(targetFileName =>
                        importPath.toLowerCase().includes(targetFileName.toLowerCase())
                    )
                )
            );

            if (owningGraphs.length === 0) continue;

            // Add ALL imports to every owning graph
            for (const graph of owningGraphs) {
                for (const importPath of imports) {
                    const toNode = this.resolveNode(importPath);
                    if (toNode) {
                        const fileName = filePath.split("/").at(-1) ?? ""
                        graph.setNodeNeighbour(fromNode, toNode);
                        graph.addFile(fileName, importPath);
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
    private resolveNode(importPath: string): cleanNode | null {
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
     * Given an import path, decide which layer this directory belongs to.
     * @param importPath the path to a file.
     * @returns 
     */
    private resolveLayer(importPath: string): cleanLayer | undefined {
        importPath = importPath.toLowerCase();
        if (importPath.includes("viewmodel")) return "interfaceAdapters"; // must be verified before 'view'
        if (importPath.includes("view")) return "frameworksAndDrivers";
        if (importPath.includes("database")) return "frameworksAndDrivers";
        if (importPath.includes("entities")) return "enterpriseBusinessRules";
        if (importPath.includes("accessinterface")) return "applicationBusinessRules"; // must be verified before 'dataAccess'
        if (importPath.includes("access")) return "frameworksAndDrivers";
        if (importPath.includes("controller")) return "interfaceAdapters";
        if (importPath.includes("presenter")) return "interfaceAdapters";
        if (importPath.includes("inputboundary")) return "applicationBusinessRules";
        if (importPath.includes("inputdata")) return "applicationBusinessRules";
        if (importPath.includes("outputboundary")) return "applicationBusinessRules";
        if (importPath.includes("outputdata")) return "applicationBusinessRules";
        if (importPath.includes("interactor")) return "applicationBusinessRules";
    }

    /**
     * For each import of a file, determine its what node it belongs to.
     * @param nodeType a map from file name to file path.
     * @param importPath a file path
     * @returns the node that an imported file belongs to.
     */
    private resolveImportToNode(nodeType: Map<string, string>, importPath: string): cleanNode | null {
        const entries = [...nodeType.entries()].sort((a, b) => b[0].length - a[0].length);
        for (const [fileName, filePath] of entries) {
            const fileType = fileName.toLowerCase().replace(/\.[^.]+$/, "");
            if (!fileType) continue;
            if (importPath.toLowerCase().includes(fileType)) {
                return this.resolveNode(filePath);
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

    /**
     * Build a list of FileStorage objects from a file path map.
     * @param fileMap a map of file name to file path.
     * @returns a list of FileStorage objects.
     */
    private buildFileStorageList(fileMap: Map<string, string>): FileStorage[] {
        const result: FileStorage[] = [];
 
        for (const [, filePath] of fileMap) {
            const node = this.resolveNode(filePath);
            const layer = this.resolveLayer(filePath);
            if (!node || !layer) continue;
 
            result.push({
                filePath,
                fileType: filePath.endsWith(".java") ? "java" : "not_java",
                layer,
                node,
            });
        }
 
        return result;
    }

    private buildNodeStorageList(files: FileStorage[]): NodeStorage[] {
        const result: NodeStorage[] = [];
        const seenIds = new Set<string>();

        const violationNodes = new Set<cleanNode>(
            this.useCaseGraphList.flatMap(uc =>
                uc.getViolationEdges().flatMap(([from, to]) => [from, to])
            )
        );

        const missingNodes = new Set<cleanNode>(
            this.useCaseGraphList.flatMap(uc => uc.getMissingNodes())
        );

        // One NodeStorage per unique file
        for (const file of files) {
            const id = file.filePath;
            if (seenIds.has(id)) continue;
            seenIds.add(id);

            result.push({
                id,
                filePath: file.filePath,
                type: file.node,
                layer: file.layer,
                status: violationNodes.has(file.node) ? "VIOLATION" : "VALID",
            });
        }

        // Ensure violation node types always get a NodeStorage entry,
        // even when no FileStorage exists for that node type
        for (const violationNode of violationNodes) {
            if (result.some(n => n.type === violationNode)) continue;

            result.push({
                id: `violation-${violationNode}`,
                type: violationNode,
                layer: this.resolveLayerFromNode(violationNode),
                status: "VIOLATION",
            });
        }

        // One NodeStorage per missing node type (no file path available)
        for (const missingNode of missingNodes) {
            if (result.some(n => n.type === missingNode)) continue;

            const matchingFile = files.find(f => f.node === missingNode);

            result.push({
                id: `missing-${missingNode}`,
                type: missingNode,
                layer: matchingFile?.layer ?? this.resolveLayerFromNode(missingNode),
                status: "MISSING",
            });
        }

        return result;
    }
    /**
     * Build a deduplicated list of EdgeStorage objects from all use case graphs.
     * Edges that appear in a use case's violationEdges are marked INCORRECT_DEPENDENCY,
     * all others are VALID.
     */
    private buildEdgeStorageList(): EdgeStorage[] {
        const result: EdgeStorage[] = [];
        const seenIds = new Set<string>();
 
        for (const uc of this.useCaseGraphList) {
            const violationSet = new Set<string>(
                uc.getViolationEdges().map(([from, to]) => `${from}->${to}`)
            );
 
            const neighbourMap = uc.getNeighbourMap();
 
            for (const [fromNode, neighbours] of Object.entries(neighbourMap) as [cleanNode, cleanNode[]][]) {
                for (const toNode of neighbours) {
                    const id = `${fromNode}->${toNode}`;
                    if (seenIds.has(id)) continue;
                    seenIds.add(id);
 
                    result.push({
                        id,
                        source: fromNode,
                        target: toNode,
                        type: "DEPENDENCY",
                        status: violationSet.has(id) ? "INCORRECT_DEPENDENCY" : "VALID",
                    });
                }
            }
        }
 
        return result;
    }
 
    /**
     * Fallback layer resolution by node type, for missing nodes that have no matching file.
     */
    private resolveLayerFromNode(node: cleanNode): cleanLayer {
        switch (node) {
            case "controller":
            case "presenter":
            case "viewModel":
                return "interfaceAdapters";

            case "view":
            case "database":
            case "dataAccess":
                return "frameworksAndDrivers";

            case "inputBoundary":
            case "inputData":
            case "outputBoundary":
            case "outputData":
            case "useCaseInteractor":
            case "dataAccessInterface":
                return "applicationBusinessRules"
                ;
            case "entities":
                return "enterpriseBusinessRules";
        }
    }

    private async populateDatabase(): Promise<void> {
        const totalUseCases = this.useCaseGraphList.length;
        let violationCount = 0;
 
        this.useCaseGraphList.forEach(useCase => {
            violationCount += useCase.getViolationCount();
        });
 
        const files: FileStorage[] = [
            ...this.buildFileStorageList(this.internalFilePaths),
            ...this.buildFileStorageList(this.externalFilePaths),
        ];

        const nodes: NodeStorage[] = this.buildNodeStorageList(files);
        const edges: EdgeStorage[] = this.buildEdgeStorageList();
 
        this.db.setNumUseCases(totalUseCases);
        this.db.setNumViolations(violationCount);
        this.db.setUseCases(this.useCaseGraphList, files);
        this.db.setNodes(nodes);
        this.db.setEdges(edges);
        this.db.setProjectName(await this.fileAccess.getProjectName());
    }

    private prepareOutput(): void {
        const lines: string[] = [];
        const lineColours: boolean[] = [];

        for (const graph of this.useCaseGraphList) {
            const violations = graph.getViolationEdges();
            const hasViolations = violations.length > 0;
            const prefix = hasViolations ? "✗" : "✓";

            lines.push(`${prefix} ${graph.getName()}`);
            lineColours.push(!hasViolations);

            if (hasViolations) {
                for (const [from, to] of violations) {
                    lines.push(`    ${from} → ${to}`);
                    lineColours.push(false);
                }
            }
        }
        this.outputData.setOutputData(lines, lineColours);
    }

    toggleCommandLine(): void {
        this.toCommandLine = !this.toCommandLine;
    }
}

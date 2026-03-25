import type { cleanNode } from "../types/cleanNode.js";
import type { neighbourMap } from "../types/neighbourMap.js";

export class useCaseGraph {
    private readonly name: string;
    private readonly outNeighbours: neighbourMap;
    private violationEdges: Array<[cleanNode, cleanNode]> = [];
    private readonly files = new Map<string, string>();

    constructor(name: string) {
        this.name = name;
        this.outNeighbours = useCaseGraph.createEmptyNeighbourMap();
    }
    
    private static createEmptyNeighbourMap(): neighbourMap {
        return {
            controller: [],
            presenter: [],
            viewModel: [],
            view: [],
            dataAccess: [],
            database: [],
            entities: [],
            inputData: [],
            inputBoundary: [],
            outputData: [],
            outputBoundary: [],
            useCaseInteractor: [],
            dataAccessInterface: [],
        };
    }

    /**
     * Add a file to this use case.
     * @param name The name of the file.
     * @param path The path to the file.
     */
    addFile(name: string, path: string): void {
        this.files.set(name, path);
    }

    getFiles(): Map<string, string> {
        return this.files;
    }

    getName(): string{
        return this.name;
    }

    /**
     * Get the list of out-neighbours from node.
     * @param node is a cleanNode type.
     * @returns an array of cleanNodes.
     */
    getNodeNeighbours(node: cleanNode): cleanNode[] {
        return this.outNeighbours[node]
    }

    /**
     * Set a node as an out neighbour with a directed edge starting at from and ending at to.
     * This function will not add a pre-existing cleanNode, nor will it allow a node to reference
     * itself.
     * @param from is of a cleanNode type.
     * @param to is of a cleanNode type.
     */
    setNodeNeighbour(from: cleanNode, to: cleanNode): void {
        if (from === to) {
            return;
        }
        if (!(this.outNeighbours[from].includes(to))) {
            this.outNeighbours[from].push(to);
        }
    }

    /**
     * Sets a violation of the Clean Architecture structure within a use case.
     * @param edge is a tuple [from, to] which indicates the origin and destination of the violation.
     */
    setViolation(edge: [cleanNode, cleanNode]): void {
        this.violationEdges.push(edge);
    }

    getViolationCount(): number {
        return this.violationEdges.length;
    }

    getViolationEdges(): Array<[cleanNode, cleanNode]> {
        return this.violationEdges;
    }

    hasViolations(): boolean {
        return this.violationEdges.length > 0;
    }

    resetViolations(): void {
        this.violationEdges = [];
    }

    getNeighbourMap(): neighbourMap {
        return this.outNeighbours;
    }

    /**
     * Iterate through the outneighbour map and return a list of nodes that NEVER appear.
     * That is a node's list is empty, and the node is never referenced by another node.
     * 
     * It is assumed that this use case graph's outneighbour map has been fully developed.
     * 
     * @returns a list of cleanNodes, those that are missing from this use case.
     */
    getMissingNodes(): cleanNode[] {
        let verificationList = Object.keys(this.outNeighbours) as cleanNode[];

        for (const [node, neighbours] of Object.entries(this.outNeighbours)) {
            if (neighbours.length > 0) {
                verificationList = verificationList.filter(n => n !== node);
            }
            verificationList = verificationList.filter(n => !neighbours.includes(n as cleanNode));
        }

        return verificationList;
    }
}

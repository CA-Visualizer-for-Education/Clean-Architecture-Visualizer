import type { cleanNode } from "./types/cleanNode.js";
import type { neighbourMap } from "./types/neighbourMap.js";

export class useCaseGraph {
    private readonly _name: string;
    private readonly _outNeighbours: neighbourMap;
    private readonly _violationEdges: Array<[cleanNode, cleanNode]> = [];
    private readonly _files = new Map<string, string>();

    constructor(name: string) {
        this._name = name;
        this._outNeighbours = useCaseGraph.createEmptyNeighbourMap();
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

    addFile(name: string, path: string): void {
        this._files.set(name, path);
    }

    getFiles(): Map<string, string> {
        return this._files;
    }

    getName(): string{
        return this._name;
    }

    /**
     * Get the list of out-neighbours from node.
     * @param node is a cleanNode type.
     * @returns an array of cleanNodes.
     */
    getNodeNeighbours(node: cleanNode): cleanNode[] {
        return this._outNeighbours[node]
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
        if (!(this._outNeighbours[from].includes(to))) {
            this._outNeighbours[from].push(to);
        }
    }

    /**
     * Records a violation of the Clean Architecture structure within a use case.
     * @param edge is a tuple [from, to] which indicates the origin and destination of the violation.
     */
    recordViolation(edge: [cleanNode, cleanNode]): void {
        this._violationEdges.push(edge);
    }

    getViolationCount(): number {
        return this._violationEdges.length;
    }

    hasViolations(): boolean {
        return this._violationEdges.length > 0;
    }
}

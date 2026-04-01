import type { cleanNode } from "./cleanNode.js"
import type { neighbourMap } from "./neighbourMap.js"
import type { cleanLayer } from "./cleanLayer.js"

export type SessionData = {
    projectName: string,
    numUseCases: number,
    numViolations: number,
    useCases: {
        id: string,
        name: string,
        outNeighbours: neighbourMap,
        fileKeys: string[], // refers to the files map
        violationEdges: [cleanNode, cleanNode][],
        missingNodes: cleanNode[]
    }[],
    files: FileStorage[],
    edges: EdgeStorage[],
    nodes: NodeStorage[],
}

export type FileStorage = {
    filePath: string,
    fileType: "java" | "not_java",
    layer: cleanLayer,
    node: cleanNode
};

export type EdgeStorage = {
    id: string,
    source: string, // Node Name
    target: string, // Node Name
    type: "DEPENDENCY",
    status: "VALID" | "INCORRECT_DEPENDENCY",
}

export type NodeStorage = {
    id: string,
    name?: string,
    filePath?: string,
    type: cleanNode,
    layer: cleanLayer,
    status: "VALID" | "MISSING" | "VIOLATION"
}

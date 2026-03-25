import type { cleanNode } from "../types/cleanNode.js";

export interface CleanArchInfoAccessInterface {
    getValidOutNeighbours(): Promise<Record<cleanNode, cleanNode[]>>;
    getNodeInfo(): Promise<Record<cleanNode, string>>;
    getLayerInfo(): Promise<Record<string, string>>;
}
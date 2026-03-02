import type { cleanNode } from "../types/cleanNode.js";

export interface ValidOutNeighbourAccessInterface {
    getValidOutNeighbours(): Promise<Record<cleanNode, cleanNode[]>>;
}
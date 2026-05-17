import type { cleanNode } from "../types/cleanNode.js";

export interface CleanArchInfoAccessInterface {
    getValidOutNeighbours(): Promise<Record<cleanNode, cleanNode[]>>;
}
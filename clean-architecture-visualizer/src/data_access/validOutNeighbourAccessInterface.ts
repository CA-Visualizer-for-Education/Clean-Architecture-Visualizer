import type { cleanNode } from "../entities/types/cleanNode.js";

export interface ValidOutNeighbourAccessInterface {
    getValidOutNeighbours(): Promise<Record<cleanNode, cleanNode[]>>;
}
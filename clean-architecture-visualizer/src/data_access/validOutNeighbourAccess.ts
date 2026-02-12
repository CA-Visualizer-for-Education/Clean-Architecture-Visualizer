import type { cleanNode } from "../entities/types/cleanNode.js";
import type { ValidOutNeighbourAccessInterface } from "./validOutNeighbourAccessInterface.js";

import outNeighbourMap from "./validOutNeighbours.json" with { type: "json" };

export class ValidOutNeighbourAccess implements ValidOutNeighbourAccessInterface {
    getValidOutNeighbours(): Promise<Record<cleanNode, cleanNode[]>> {
        return Promise.resolve(outNeighbourMap as Record<cleanNode, cleanNode[]>);
    }
}

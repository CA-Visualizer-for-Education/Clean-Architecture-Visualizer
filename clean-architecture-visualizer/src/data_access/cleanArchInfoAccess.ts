import type { cleanNode } from "../types/cleanNode.js";
import type { cleanLayer } from "../types/cleanLayer.js";

import type { CleanArchInfoAccessInterface } from "./cleanArchInfoAccessInterface.js";

import cleanNodeInfo from "../database/cleanArchStaticInfo.json" with { type: "json" };

export class CleanArchAccess implements CleanArchInfoAccessInterface {
    getValidOutNeighbours(): Promise<Record<cleanNode, cleanNode[]>> {
        const outNeighboursOnly = Object.fromEntries(
            Object.entries(cleanNodeInfo.nodes).map(([key, value]) => [key, value.outNeighbours])
        );
        return Promise.resolve(outNeighboursOnly as Record<cleanNode, cleanNode[]>);
    }

    getNodeInfo(): Promise<Record<cleanNode, string>> {
        const cleanNodeLearningInfo = Object.fromEntries(
            Object.entries(cleanNodeInfo.nodes).map(([key, value]) => [key, value.nodeDescription])
        );
        return Promise.resolve(cleanNodeLearningInfo as Record<cleanNode, string>);
    }

    getLayerInfo(): Promise<Record<cleanLayer, string>> {
        return Promise.resolve(cleanNodeInfo.layers);
    }
}

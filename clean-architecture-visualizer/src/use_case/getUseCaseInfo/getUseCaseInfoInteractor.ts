import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { NodeStorage, EdgeStorage } from "../../types/sessionData.js";
import type { GetUseCaseInfoInputBoundary } from "./getUseCaseInfoInputBoundary.js";
import type { GetUseCaseInfoInputData } from "./getUseCaseInfoInputData.js";
import type { GetUseCaseInfoOutputData } from "./getUseCaseInfoOutputData.js";

export type UseCaseInfoResponse = {
    interaction_name: string;
    nodes: UseCaseNodeResponse[];
    edges: UseCaseEdgeResponse[];
};

type UseCaseNodeResponse = {
    id: string;
    name?: string;
    type: string;
    layer: string;
    file_path?: string;
    status: "VALID" | "MISSING" | "VIOLATION";
};

type UseCaseEdgeResponse = {
    id: string;
    source: string;
    target: string;
    type: "DEPENDENCY";
    status: "VALID" | "INCORRECT_DEPENDENCY";
};

export class GetUseCaseInfoInteractor implements GetUseCaseInfoInputBoundary {

    constructor(
        private readonly db: SessionDBAccessInterface,
        private readonly inputData: GetUseCaseInfoInputData,
        private readonly outputData: GetUseCaseInfoOutputData
    ) {}

    async execute(): Promise<void> {
        const id = this.inputData.getInteractionId();
        const useCase = this.db.getUseCaseById(id);
        if (!useCase) return;

        const nodes = this.buildNodes(useCase);
        const edges = this.buildEdges(useCase);

        const result = {
            interaction_name: useCase.name,
            nodes: nodes,
            edges: edges,
        };

        this.outputData.setOutputData(result);
    }

    /**
     * Build the node list for a use case.
     * - VALID / VIOLATION nodes come from NodeStorage entries whose filePath
     *   is referenced by the use case's fileKeys.
     * - MISSING nodes come from the use case's missingNodes list.
     */
    private buildNodes(
        useCase: ReturnType<SessionDBAccessInterface["getUseCaseById"]> & {}
    ): UseCaseNodeResponse[] {
        const result: UseCaseNodeResponse[] = [];
        const fileKeySet = new Set(useCase.fileKeys);

        // Nodes backed by real files
        const fileNodes = this.db.getAllNodes().filter(
            n => n.filePath && fileKeySet.has(n.filePath)
        );

        for (const node of fileNodes) {
            result.push(this.formatNode(node));
        }

        // Missing nodes — one entry per missing cleanNode type
        for (const missingType of useCase.missingNodes) {
            const existing = this.db.getNodesByStatus("MISSING").find(
                n => n.type === missingType
            );

            if (existing) {
                result.push(this.formatNode(existing));
            }
        }

        return result;
    }

    /**
     * Build the edge list for a use case by collecting all source→target
     * pairs present in the use case's outNeighbours map, then looking them
     * up in EdgeStorage for status information.
     */
    private buildEdges(
        useCase: ReturnType<SessionDBAccessInterface["getUseCaseById"]> & {}
    ): UseCaseEdgeResponse[] {
        const result: UseCaseEdgeResponse[] = [];

        for (const [source, targets] of Object.entries(useCase.outNeighbours)) {
            for (const target of targets) {
                const edgeId = `${source}->${target}`;
                const edge = this.db.getEdgeById(edgeId);
                if (!edge) continue;

                result.push(this.formatEdge(edge));
            }
        }

        return result;
    }

    private formatNode(node: NodeStorage): UseCaseNodeResponse {
        return {
            id: node.id,
            ...(node.name && { name: node.name }),
            type: node.type,
            layer: node.layer,
            ...(node.filePath && { file_path: node.filePath }),
            status: node.status,
        };
    }

    private formatEdge(edge: EdgeStorage): UseCaseEdgeResponse {
        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            status: edge.status,
        };
    }
}
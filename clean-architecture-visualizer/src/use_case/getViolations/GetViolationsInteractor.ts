import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { cleanNode } from "../../types/cleanNode.js";
import type { GetViolationsInputData } from "./GetViolationsInputData.js";
import type { GetViolationsInputBoundary } from "./GetViolationsInputBoundary.js";
import type { GetViolationsOutputData } from "./GetViolationsOutputData.js";

export type ViolationResponse = {
    violations: ViolationEntry[];
};

type ViolationEntry = {
    id: string;
    type: "INCORRECT_DEPENDENCY";
    message: string;
    suggestion: string;
    related_node_ids: string[];
    related_edge_id: string;
    file_context?: FileContext;
};

type FileContext = {
    file: string;
    line_number?: number;
    snippet?: string;
};

export class GetViolationsInteractor implements GetViolationsInputBoundary {

    constructor(
        private readonly db: SessionDBAccessInterface,
        private readonly fileAccess: FileAccessInterface,
        private readonly inputData: GetViolationsInputData,
        private readonly outputData: GetViolationsOutputData
    ) {}

    async execute(): Promise<void> {
        const interactionId = this.inputData.getInteractionId();

        const useCase = this.db.getUseCaseById(interactionId);
        if (!useCase) return undefined;

        const violations: ViolationEntry[] = await Promise.all(
            useCase.violationEdges.map(async ([from, to], index) => {
                const edgeId = `${from}->${to}`;
                const relatedNodeIds = this.resolveRelatedNodeIds(from, to, useCase.fileKeys);
                const fileContext = await this.resolveFileContext(from, to, useCase.fileKeys);

                return {
                    id: `v-${index}`,
                    type: "INCORRECT_DEPENDENCY",
                    message: "",
                    suggestion: "",
                    related_node_ids: relatedNodeIds,
                    related_edge_id: edgeId,
                    file_context: fileContext,
                };
            })
        );

        this.outputData.setOutputData(violations);
    }

    /**
     * Find node ids in the DB that match the source or target of the violation
     * and belong to this use case's file keys.
     */
    private resolveRelatedNodeIds(from: cleanNode, to: cleanNode, fileKeys: string[]): string[] {
        const fileKeySet = new Set(fileKeys);

        return this.db.getAllNodes()
            .filter(n =>
                (n.type === from || n.type === to) &&
                n.filePath !== undefined &&
                fileKeySet.has(n.filePath)
            )
            .map(n => n.id);
    }

    /**
     * Reads the source file of the violation's origin node to populate file_context.
     * Returns undefined if no matching file is found in this use case's file keys.
     */
    private async resolveFileContext(from: cleanNode, to: cleanNode, fileKeys: string[]): Promise<FileContext | undefined> {
        const fileKeySet = new Set(fileKeys);

        const matchingNode = this.db.getAllNodes().find(
            n => n.type === from && n.filePath !== undefined && fileKeySet.has(n.filePath)
        );

        if (!matchingNode?.filePath) return undefined;

        const fileName = matchingNode.filePath.split("/").at(-1);
        if (!fileName) return undefined;

        const [snippet, line_number] = await Promise.all([
            this.fileAccess.getFileSnippet(matchingNode.filePath, to),
            this.fileAccess.getLineNumber(matchingNode.filePath, to),
        ]);

        return {
            file: fileName,
            ...(snippet && { snippet }),
            ...(line_number && { line_number }),
        };
    }
}
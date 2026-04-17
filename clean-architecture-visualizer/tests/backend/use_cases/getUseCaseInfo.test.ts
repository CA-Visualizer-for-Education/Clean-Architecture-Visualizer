import { describe, it, expect, beforeEach } from '@jest/globals';
import { GetUseCaseInfoInteractor } from "../../../src/use_case/getUseCaseInfo/getUseCaseInfoInteractor.js";
import { SessionDBAccess } from "../../../src/data_access/sessionDBAccess.js";
import type { GetUseCaseInfoInputData } from "../../../src/use_case/getUseCaseInfo/getUseCaseInfoInputData.js";
import type { GetUseCaseInfoOutputData } from "../../../src/use_case/getUseCaseInfo/getUseCaseInfoOutputData.js";

const genericDBAccess = new SessionDBAccess();

function makeInputData(id: string): GetUseCaseInfoInputData {
    return {
        getInteractionId: () => id,
    } as unknown as GetUseCaseInfoInputData;
}

function makeOutputData(): GetUseCaseInfoOutputData & { result: any } {
    return {
        result: undefined,
        setOutputData(data: any) { this.result = data; },
        getOutputData() { return this.result; }
    } as GetUseCaseInfoOutputData & { result: any };
}

describe("GetUseCaseInfoInteractor", () => {

    beforeEach(() => {
        genericDBAccess.resetDB();
    });

    it("returns nothing if the use case ID does not exist", async () => {
        const outputData = makeOutputData();
        const interactor = new GetUseCaseInfoInteractor(genericDBAccess, makeInputData("non-existent"), outputData);

        await interactor.execute();

        expect(outputData.result).toBeUndefined();
    });

    it("correctly assembles nodes from fileKeys", async () => {
        const filePath = "src/entities/User.java";
        
        // 1. Setup a node in the DB
        genericDBAccess.upsertNode({
            id: "node-1",
            name: "User",
            type: "entities",
            layer: "enterpriseBusinessRules",
            filePath: filePath,
            status: "VALID"
        });

        // 2. Setup a use case that references that file
        const mockUseCase = {
            id: "uc-1",
            name: "Create User",
            fileKeys: [filePath],
            missingNodes: [],
            outNeighbours: {}
        };
        // Using any if upsertUseCase isn't public, or standard method if it is
        (genericDBAccess as any).upsertUseCase(mockUseCase);

        const outputData = makeOutputData();
        const interactor = new GetUseCaseInfoInteractor(genericDBAccess, makeInputData("uc-1"), outputData);

        await interactor.execute();

        expect(outputData.result.interaction_name).toBe("Create User");
        // Check if node was found via fileKey
        expect(outputData.result.nodes).toHaveLength(1);
        expect(outputData.result.nodes[0].file_path).toBe(filePath);
    });

    it("includes missing nodes based on the use case missingNodes list", async () => {
        // Setup a "MISSING" status node in the DB
        genericDBAccess.upsertNode({
            id: "missing-controller",
            type: "controller",
            layer: "interfaceAdapters",
            status: "MISSING"
        });

        const mockUseCase = {
            id: "uc-1",
            name: "Test Missing",
            fileKeys: [],
            missingNodes: ["controller"],
            outNeighbours: {}
        };
        (genericDBAccess as any).upsertUseCase(mockUseCase);

        const outputData = makeOutputData();
        const interactor = new GetUseCaseInfoInteractor(genericDBAccess, makeInputData("uc-1"), outputData);

        await interactor.execute();

        const missingNode = outputData.result.nodes.find((n: any) => n.status === "MISSING");
        expect(missingNode).toBeDefined();
        expect(missingNode.type).toBe("controller");
    });

    it("assembles edges from the outNeighbours map", async () => {
        const sourceId = "controller-node";
        const targetId = "interactor-node";
        const edgeId = `${sourceId}->${targetId}`;

        // Setup the edge in the DB
        (genericDBAccess as any).upsertEdge({
            id: edgeId,
            source: sourceId,
            target: targetId,
            type: "DEPENDENCY",
            status: "VALID"
        });

        const mockUseCase = {
            id: "uc-edge",
            name: "Edge Test",
            fileKeys: [],
            missingNodes: [],
            outNeighbours: {
                [sourceId]: [targetId]
            }
        };
        (genericDBAccess as any).upsertUseCase(mockUseCase);

        const outputData = makeOutputData();
        const interactor = new GetUseCaseInfoInteractor(genericDBAccess, makeInputData("uc-edge"), outputData);

        await interactor.execute();

        expect(outputData.result.edges).toHaveLength(1);
        expect(outputData.result.edges[0].id).toBe(edgeId);
        expect(outputData.result.edges[0].status).toBe("VALID");
    });
});
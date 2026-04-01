import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { GetViolationsInteractor } from "../../../src/use_case/getViolations/GetViolationsInteractor.js";
import { SessionDBAccess } from "../../../src/data_access/sessionDBAccess.js";
import { FileAccess } from "../../../src/data_access/fileAccess.js";
import type { GetViolationsInputData } from "../../../src/use_case/getViolations/GetViolationsInputData.js";
import type { GetViolationsOutputData } from "../../../src/use_case/getViolations/GetViolationsOutputData.js";

const genericDBAccess = new SessionDBAccess();
const genericFileAccess = new FileAccess();

function makeInputData(interactionId: string): GetViolationsInputData {
    return {
        getInteractionId: () => interactionId,
    } as unknown as GetViolationsInputData;
}

function makeOutputData(): GetViolationsOutputData & { result: any } {
    return {
        result: undefined,
        setOutputData(data: any) { this.result = data; },
        getOutputData() { return this.result; }
    } as GetViolationsOutputData & { result: any };
}

describe("GetViolationsInteractor", () => {

    beforeEach(() => {
        genericDBAccess.resetDB();
        jest.restoreAllMocks();
        
        // Default mocks for FileAccess
        jest.spyOn(genericFileAccess, 'getFileSnippet').mockResolvedValue(undefined);
        jest.spyOn(genericFileAccess, 'getLineNumber').mockResolvedValue(undefined);
    });

    it("returns undefined and does not set output if use case is not found", async () => {
        const outputData = makeOutputData();
        const interactor = new GetViolationsInteractor(
            genericDBAccess, genericFileAccess, makeInputData("invalid-id"), outputData
        );

        await interactor.execute();

        expect(outputData.result).toBeUndefined();
    });

    describe("execute — Violation Mapping", () => {
        const fromNode = "controller";
        const toNode = "entities";
        const filePath = "src/interface_adapters/UserController.java";

        beforeEach(() => {
            // Setup a node that belongs to the "from" side of the violation
            genericDBAccess.upsertNode({
                id: "node-controller-1",
                name: "UserController",
                type: fromNode,
                layer: "interfaceAdapters",
                filePath: filePath,
                status: "VALID"
            });

            // Setup the use case with a violation edge
            const mockUseCase = {
                id: "uc-1",
                name: "Process User",
                fileKeys: [filePath],
                violationEdges: [[fromNode, toNode]] as [string, string][]
            };
            (genericDBAccess as any).upsertUseCase(mockUseCase);
        });

        it("correctly resolves related node IDs", async () => {
            const outputData = makeOutputData();
            const interactor = new GetViolationsInteractor(
                genericDBAccess, genericFileAccess, makeInputData("uc-1"), outputData
            );

            await interactor.execute();

            const violation = outputData.result[0];
            expect(violation.related_node_ids).toContain("node-controller-1");
            expect(violation.related_edge_id).toBe(`${fromNode}->${toNode}`);
        });

        it("populates file context with snippets and line numbers from FileAccess", async () => {
            const mockSnippet = "import entities.User;";
            const mockLine = 5;

            jest.spyOn(genericFileAccess, 'getFileSnippet').mockResolvedValue(mockSnippet);
            jest.spyOn(genericFileAccess, 'getLineNumber').mockResolvedValue(mockLine);

            const outputData = makeOutputData();
            const interactor = new GetViolationsInteractor(
                genericDBAccess, genericFileAccess, makeInputData("uc-1"), outputData
            );

            await interactor.execute();

            const context = outputData.result[0].file_context;
            expect(context.file).toBe("UserController.java");
            expect(context.snippet).toBe(mockSnippet);
            expect(context.line_number).toBe(mockLine);
        });

        it("handles missing file context gracefully if no matching node exists", async () => {
            // Reset DB and add use case without matching nodes
            genericDBAccess.resetDB();
            (genericDBAccess as any).upsertUseCase({
                id: "uc-empty",
                fileKeys: ["some/path.java"],
                violationEdges: [["A", "B"]]
            });

            const outputData = makeOutputData();
            const interactor = new GetViolationsInteractor(
                genericDBAccess, genericFileAccess, makeInputData("uc-empty"), outputData
            );

            await interactor.execute();

            expect(outputData.result[0].file_context).toBeUndefined();
        });
    });
});
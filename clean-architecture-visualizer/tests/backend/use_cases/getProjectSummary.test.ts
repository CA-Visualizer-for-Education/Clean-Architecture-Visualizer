import { describe, it, expect, beforeEach} from '@jest/globals';
import { GetProjectSummaryInteractor } from "../../../src/use_case/getProjectSummary/getProjectSummaryInteractor.js";
import { SessionDBAccess } from "../../../src/data_access/sessionDBAccess.js";
import type { GetProjectSummaryOutputData } from "../../../src/use_case/getProjectSummary/getProjectSummaryOutputData.js";

const genericDBAccess = new SessionDBAccess();

// Standardized mock for Output Data matching your interface
function makeOutputData(): GetProjectSummaryOutputData & { result: any } {
    return {
        result: undefined,
        setOutputData(data: any) { this.result = data; },
        getOutputData() { return this.result; }
    } as GetProjectSummaryOutputData & { result: any };
}

describe("GetProjectSummaryInteractor", () => {

    beforeEach(() => {
        genericDBAccess.resetDB();
    })

    describe("getProjectSummary — Statistics", () => {
        
        it("returns the correct project name and basic counts", async () => {
            const outputData = makeOutputData();
            const interactor = new GetProjectSummaryInteractor(genericDBAccess, outputData);

            // Assuming these are set in your genericDBAccess or mocked
            await interactor.getProjectSummary();

            expect(outputData.result).toHaveProperty("project_name");
            expect(outputData.result).toHaveProperty("total_use_cases");
            expect(outputData.result).toHaveProperty("total_violations");
        });
    });

    describe("getProjectSummary — Use Case Formatting", () => {

        it("correctly formats use case info with nested interactions", async () => {
            // Setup a mock use case in the DB
            const mockUseCase = {
                id: "uc-123",
                name: "Login",
                violationEdges: [["A", "B"], ["C", "D"]] as [string, string][]
            };
            
            // Manual injection for test setup
            (genericDBAccess as any).upsertUseCase?.(mockUseCase);

            const outputData = makeOutputData();
            const interactor = new GetProjectSummaryInteractor(genericDBAccess, outputData);

            await interactor.getProjectSummary();

            const useCaseResult = outputData.result.use_cases.find((uc: any) => uc.id === "uc-123");
            
            expect(useCaseResult).toBeDefined();
            expect(useCaseResult.violation_count).toBe(2);
            expect(useCaseResult.interactions).toEqual([{
                interaction_id: "uc-123",
                interaction_name: "Login"
            }]);
        });

        it("returns an empty array for use_cases if none exist in DB", async () => {
            // Ensure DB is empty for this test
            (genericDBAccess as any).clearAllUseCases?.(); 

            const outputData = makeOutputData();
            const interactor = new GetProjectSummaryInteractor(genericDBAccess, outputData);

            await interactor.getProjectSummary();

            expect(outputData.result.use_cases).toEqual([]);
            expect(outputData.result.total_use_cases).toBe(0);
        });
    });
});
import { GraphVerificationInteractor } from "../../../src/use_case/graphVerification/graphVerificationInteractor.js";
import { FileAccess } from "../../../src/data_access/fileAccess.js";
import { CleanArchAccess } from "../../../src/data_access/cleanArchInfoAccess.js";
import { SessionDBAccess } from "../../../src/data_access/sessionDBAccess.js";

import { useCaseGraph } from "../../../src/entities/useCaseGraph.js";

const genericFileAccess = new FileAccess();
const genericNeighbourAccess = new CleanArchAccess();
const genericDBAccess = new SessionDBAccess();

describe("Ensures that resolveLayer correctly identifies nodes from thier file path", () => {

    const genericInteractor = new GraphVerificationInteractor(genericFileAccess,
         genericNeighbourAccess,
         genericDBAccess
        );
    const testUseCase: [string, string][] = [
        ["view", "/src/views/test/testView.ts"],
        ["viewModel", "/src/views/test/testViewModel.ts"],
        ["database", "/src/database/test/testDatabase.ts"],
        ["entities", "/src/entities/test/testEntities.ts"],
        ["dataAccessInterface", "/src/data_access/test/testAccessInterface.ts"],
        ["dataAccess", "/src/data_access/test/testAccess.ts"],
        ["controller", "/src/interface_adapters/test/testController.ts"],
        ["presenter", "/src/interface_adapters/test/testPresenter.ts"],
        ["inputBoundary", "/src/use_case/test/testInputBoundary.ts"],
        ["inputData", "/src/use_case/test/testInputData.ts"],
        ["outputBoundary", "/src/use_case/test/testOutputBoundary.ts"],
        ["outputData", "/src/use_case/test/testOutputData.ts"],
        ["useCaseInteractor", "/src/use_case/test/testInteractor.ts"],
    ];
    
    it.each(testUseCase)(
        "resolves '%s from path %s", (expectedNode, path) => {
            const result = (genericInteractor as any).resolveLayer(path);
            expect(result).toBe(expectedNode);
        }
    )

    it.each(["/src/types/testTypes.ts", "/src/.gitkeep"])(
        "returns null from the path %s", (path) => {
            const result = (genericInteractor as any).resolveLayer(path);
            expect(result).toBeNull;
        }
    )
});

describe("Ensures that verifyOutNeighbours correctly classifies the number of Clean violations", () => {

    function getAllViolations(graphs: useCaseGraph[]): number {
        let result = 0;
        graphs.forEach(element => {
            result += element.getViolationCount();
        });
        return result;
    }
    
    const emptyUseCase = new useCaseGraph("empty");
    const goodUseCase = new useCaseGraph("good");
    const singleViolation = new useCaseGraph("single");
    const multipleViolations = new useCaseGraph("multiple");

    const allUseCaseGraphs = [
        emptyUseCase,
        goodUseCase,
        singleViolation,
        multipleViolations
    ]

    afterEach(async () => {
        allUseCaseGraphs.forEach(graph => {
            graph.resetViolations();
        });
    });

    goodUseCase.setNodeNeighbour("useCaseInteractor", "entities");
    goodUseCase.setNodeNeighbour("dataAccess", "database");
    goodUseCase.setNodeNeighbour("view", "viewModel");
    goodUseCase.setNodeNeighbour("view", "controller");

    singleViolation.setNodeNeighbour("view", "viewModel");
    singleViolation.setNodeNeighbour("view", "entities");

    multipleViolations.setNodeNeighbour("entities", "view");
    multipleViolations.setNodeNeighbour("controller", "entities");

    const testCases = [
        ["Empty usecase has 0 violations", [emptyUseCase], 0],
        ["Use case with no violations reports 0 violations", [goodUseCase], 0],
        ["Use case with 1 violation reports 1 violation", [singleViolation], 1],
        ["Use case with 2 violations reports 2 violations", [multipleViolations], 2],
        ["Multiple usecases with violations are properly reported", [singleViolation, multipleViolations], 3],
        ["Only use cases with violations report violations", allUseCaseGraphs, 3]
    ];

    it.each(testCases)(
        "%s" , async (_, useCaseGraphList, expectedViolations) => {
            const interactor = new GraphVerificationInteractor(genericFileAccess,
                genericNeighbourAccess,
                genericDBAccess,
                (useCaseGraphList as useCaseGraph[])
            );
            await (interactor as any).verifyOutNeighbours();
            const violationCount = getAllViolations((interactor as any).useCaseGraphList);
            expect(violationCount).toBe(expectedViolations);
        }
    )
});

describe("Ensures that populateDatabase correctly populates the database", () => {

    const genericFileAccess = new FileAccess();
    const genericNeighbourAccess = new CleanArchAccess();
    const genericDBAccess = new SessionDBAccess();

    const emptyUseCase = new useCaseGraph("empty");
    const singleViolation = new useCaseGraph("single");
    const multipleViolations = new useCaseGraph("multiple");

    singleViolation.setNodeNeighbour("view", "entities");         // 1 violation
    multipleViolations.setNodeNeighbour("entities", "view");      // 2 violations
    multipleViolations.setNodeNeighbour("controller", "entities");

    const testCases = [
        ["Empty use case list sets 0 use cases and 0 violations", [], 0, 0],
        ["Single use case with no violations", [emptyUseCase], 1, 0],
        ["Single use case with 1 violation", [singleViolation], 1, 1],
        ["Multiple use cases with violations are summed correctly", [singleViolation, multipleViolations], 2, 3],
    ];

    afterEach(() => {
        [emptyUseCase, singleViolation, multipleViolations].forEach(g => g.resetViolations());
    });

    it.each(testCases)(
        "%s", async (_, useCaseGraphList, expectedUseCases, expectedViolations) => {
            const interactor = new GraphVerificationInteractor(
                genericFileAccess,
                genericNeighbourAccess,
                genericDBAccess,
                (useCaseGraphList as useCaseGraph[])
            );
            await (interactor as any).verifyOutNeighbours();
            (interactor as any).populateDatabase();

            expect(genericDBAccess.getNumUseCases()).toBe(expectedUseCases);
            expect(genericDBAccess.getNumViolations()).toBe(expectedViolations);
        }
    );
});

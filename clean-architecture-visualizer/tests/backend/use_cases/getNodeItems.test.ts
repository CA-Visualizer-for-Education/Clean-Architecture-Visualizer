import { GetNodeItemsInteractor } from "../../../src/use_case/getNodeItems/getNodeItemsInteractor.js";
import { SessionDBAccess } from "../../../src/data_access/sessionDBAccess.js";
import { GetNodeItemsOutputData } from "../../../src/use_case/getNodeItems/getNodeItemsOutputData.js";
import { GetNodeItemsInputData } from "../../../src/use_case/getNodeItems/getNodeItemsInputData.js";
// Mock db

const mockGetAllFiles = jest.fn();
const mockDb = {
    getAllFiles: mockGetAllFiles,
};

describe("GetNodeItemsInteractor", () => {

    let outputData: GetNodeItemsOutputData;

    beforeEach(() => {
        outputData = new GetNodeItemsOutputData();
        mockGetAllFiles.mockReset();
    });

    it("groups filenames by node", () => {
        mockGetAllFiles.mockReturnValue([
            { filePath: "src/interface_adapter/getNodeItems/getNodeItemsController.ts", node: "controller", layer: "interfaceAdapter" },
            { filePath: "src/interface_adapter/getRelations/getRelationsController.ts", node: "controller", layer: "interfaceAdapter" },
            { filePath: "src/use_case/getNodeItems/getNodeItemsInteractor.ts", node: "useCaseInteractor", layer: "useCase" },
        ]);
        const inputData = new GetNodeItemsInputData('usecase1')
        const interactor = new GetNodeItemsInteractor(mockDb as any, inputData, outputData);
        interactor.getNodeItems();
        const result = outputData.getOutputData();

        expect(result).toEqual({
            controller: ["getNodeItemsController.ts", "getRelationsController.ts"],
            useCaseInteractor: ["getNodeItemsInteractor.ts"],
        });
    });

    it("returns an empty object when there are no files", () => {
        mockGetAllFiles.mockReturnValue([]);
        const inputData = new GetNodeItemsInputData('usecase1')
        const interactor = new GetNodeItemsInteractor(mockDb as any, inputData, outputData);
        interactor.getNodeItems();
        const result = outputData.getOutputData();

        expect(result).toEqual({});
    });

    it("handles a single file correctly", () => {
        mockGetAllFiles.mockReturnValue([
            { filePath: "src/use_case/getNodeItems/getNodeItemsInteractor.ts", node: "useCaseInteractor", layer: "useCase" },
        ]);
        const inputData = new GetNodeItemsInputData('usecase1')
        const interactor = new GetNodeItemsInteractor(mockDb as any, inputData, outputData);
        interactor.getNodeItems();
        const result = outputData.getOutputData();

        expect(result).toEqual({
            useCaseInteractor: ["getNodeItemsInteractor.ts"],
        });
    });

    it("extracts only the filename from a deep path", () => {
        mockGetAllFiles.mockReturnValue([
            { filePath: "src/a/b/c/d/somefile.ts", node: "presenter", layer: "interfaceAdapter" },
        ]);
        const inputData = new GetNodeItemsInputData('usecase1')
        const interactor = new GetNodeItemsInteractor(mockDb as any, inputData, outputData);
        interactor.getNodeItems();
        const result = outputData.getOutputData();

        expect(result!["presenter"]).toEqual(["somefile.ts"]);
    });
});

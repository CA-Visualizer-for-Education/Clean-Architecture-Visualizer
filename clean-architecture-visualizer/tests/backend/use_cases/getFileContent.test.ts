import { describe, it, expect, beforeEach, afterEach} from '@jest/globals';
import { GetFileContentInteractor } from "../../../src/use_case/getFileContent/getFileContentInteractor.js";
import { FileAccess } from "../../../src/data_access/fileAccess.js";
import { SessionDBAccess } from "../../../src/data_access/sessionDBAccess.js";
import type { GetFileContentInputData } from "../../../src/use_case/getFileContent/getFileContentInputData.js";
import type { GetFileContentOutputData } from "../../../src/use_case/getFileContent/getFileContentOutputData.js";
import type { FileStorage } from "../../../src/types/sessionData.js";

const genericFileAccess = new FileAccess();
const genericDBAccess = new SessionDBAccess();

// Minimal mock for input/output data
function makeInputData(filePath: string, interactionId: string = "uc-0"): GetFileContentInputData {
    return {
        getFilePath: () => filePath,
        getInteractionId: () => interactionId,
    } as unknown as GetFileContentInputData;
}

function makeOutputData(): GetFileContentOutputData & { result: any } {
    return {
        result: undefined,
        setOutputData(data: any) { this.result = data; },
        getOutputData() { return this.result; }
    };
}

const mockFile: FileStorage = {
    filePath: "/src/interface_adapters/UserSignupController.java",
    fileType: "java",
    layer: "interfaceAdapters",
    node: "controller",
};

describe("GetFileContentInteractor", () => {

    describe("getFileContent — file found in DB", () => {

        beforeEach(() => {
            genericDBAccess.upsertFile(mockFile);
        });

        afterEach(() => {
            genericDBAccess.removeFile(mockFile.filePath);
        });

        it("sets file_path on the output data", async () => {
            const inputData = makeInputData("/src/interface_adapters/UserSignupController.java");
            const outputData = makeOutputData();
            const interactor = new GetFileContentInteractor(genericDBAccess, genericFileAccess, inputData, outputData);

            await interactor.getFileContent();

            expect(outputData.result?.file_path).toBe("/src/interface_adapters/UserSignupController.java");
        });

        it("sets layer from FileStorage on the output data", async () => {
            const inputData = makeInputData("/src/interface_adapters/UserSignupController.java");
            const outputData = makeOutputData();
            const interactor = new GetFileContentInteractor(genericDBAccess, genericFileAccess, inputData, outputData);

            await interactor.getFileContent();

            expect(outputData.result?.layer).toBe("interfaceAdapters");
        });

        it("sets language to 'java' for java files", async () => {
            const inputData = makeInputData("/src/interface_adapters/UserSignupController.java");
            const outputData = makeOutputData();
            const interactor = new GetFileContentInteractor(genericDBAccess, genericFileAccess, inputData, outputData);

            await interactor.getFileContent();

            expect(outputData.result?.language).toBe("java");
        });

        it("sets language to 'not_java' for non-java files", async () => {
            const tsFile: FileStorage = {
                filePath: "/src/interface_adapters/UserSignupController.ts",
                fileType: "not_java",
                layer: "interfaceAdapters",
                node: "controller",
            };
            genericDBAccess.upsertFile(tsFile);

            const inputData = makeInputData("/src/interface_adapters/UserSignupController.ts");
            const outputData = makeOutputData();
            const interactor = new GetFileContentInteractor(genericDBAccess, genericFileAccess, inputData, outputData);

            await interactor.getFileContent();

            expect(outputData.result?.language).toBe("not_java");

            genericDBAccess.removeFile(tsFile.filePath);
        });

        it("initialises violation fields as empty arrays", async () => {
            const inputData = makeInputData("/src/interface_adapters/UserSignupController.java");
            const outputData = makeOutputData();
            const interactor = new GetFileContentInteractor(genericDBAccess, genericFileAccess, inputData, outputData);

            await interactor.getFileContent();

            expect(outputData.result?.Violation_words).toEqual([]);
            expect(outputData.result?.lines_with_violations).toEqual([]);
        });
    });

    describe("getFileContent — file not found in DB", () => {

        it("does not set output data when file is missing from DB", async () => {
            const inputData = makeInputData("/src/interface_adapters/NonExistent.java");
            const outputData = makeOutputData();
            const interactor = new GetFileContentInteractor(genericDBAccess, genericFileAccess, inputData, outputData);

            await interactor.getFileContent();

            expect(outputData.result).toBeUndefined();
        });
    });
});
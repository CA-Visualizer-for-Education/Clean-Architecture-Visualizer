import { describe, it, expect, beforeEach} from '@jest/globals';

import { GetFileTreeInteractor } from "../../../src/use_case/getFileTree/getFileTreeInteractor.js";
import { SessionDBAccess } from "../../../src/data_access/sessionDBAccess.js";
import type { GetFileTreeOutputData } from "../../../src/use_case/getFileTree/getFileTreeOuptutData.js";
import type { FileStorage } from "../../../src/types/sessionData.js";
import type { FileTreeNode } from "../../../src/types/fileTreeNode.js";

let genericDBAccess = new SessionDBAccess();

// mock for output data
function makeOutputData(): GetFileTreeOutputData & { result: FileTreeNode | undefined } {
    return {
        result: undefined,
        setOutputData(data: FileTreeNode) { this.result = data; }
    };
}

describe("GetFileTreeInteractor", () => {

    describe("getFileTree — Tree Construction", () => {

        beforeEach(() => {
            genericDBAccess.resetDB();
        });

        it("creates a root node even if no files exist", async () => {
            const outputData = makeOutputData();
            const interactor = new GetFileTreeInteractor(genericDBAccess, outputData);

            await interactor.getFileTree();

            expect(outputData.result?.id).toBe("src");
            expect(outputData.result?.children).toEqual([]);
        });

        it("correctly nests a file within a sub-directory", async () => {
            const mockFile: FileStorage = {
                filePath: "project/src/entities/User.java",
                fileType: "java",
                layer: "entities",
                node: "UserNode",
            };
            genericDBAccess.upsertFile(mockFile);

            const outputData = makeOutputData();
            const interactor = new GetFileTreeInteractor(genericDBAccess, outputData);

            await interactor.getFileTree();

            // Structure: src -> entities (dir) -> User.java (file)
            const entitiesDir = outputData.result?.children?.find(c => c.name === "entities");
            expect(entitiesDir?.type).toBe("directory");
            expect(entitiesDir?.path).toBe("src/entities/");

            const fileNode = entitiesDir?.children?.find(c => c.name === "User.java");
            expect(fileNode?.type).toBe("file");
            expect(fileNode?.path).toBe(mockFile.filePath);

            genericDBAccess.removeFile(mockFile.filePath);
        });

        it("shares the same directory node for multiple files in that directory", async () => {
            const file1: FileStorage = { filePath: "src/util/A.java", fileType: "java", layer: "entities", node: "A" };
            const file2: FileStorage = { filePath: "src/util/B.java", fileType: "java", layer: "entities", node: "B" };
            
            genericDBAccess.upsertFile(file1);
            genericDBAccess.upsertFile(file2);

            const outputData = makeOutputData();
            const interactor = new GetFileTreeInteractor(genericDBAccess, outputData);

            await interactor.getFileTree();

            const utilDir = outputData.result?.children?.find(c => c.name === "util");
            expect(utilDir?.children?.length).toBe(2);

            genericDBAccess.removeFile(file1.filePath);
            genericDBAccess.removeFile(file2.filePath);
        });
    });

    describe("getFileTree — Violation Detection", () => {

        beforeEach(() => {
            genericDBAccess.resetDB();
        });

        it("marks hasViolation as true if the file node is in violationEdges", async () => {
            const mockFile: FileStorage = {
                filePath: "src/entities/User.java",
                fileType: "java",
                layer: "enterpriseBusinessRules",
                node: "entities",
            };
            
            const mockUseCase = {
                violationEdges: [["entities", "presenter"]]
            };

            // Assuming your DBAccess allows adding use cases
            genericDBAccess.upsertFile(mockFile);
            (genericDBAccess as any).upsertUseCase?.(mockUseCase); 

            const outputData = makeOutputData();
            const interactor = new GetFileTreeInteractor(genericDBAccess, outputData);

            await interactor.getFileTree();

            const entitiesDir = outputData.result?.children?.find(c => c.name === "entities");
            const fileNode = entitiesDir?.children?.[0];

            expect(fileNode?.hasViolation).toBe(true);

            genericDBAccess.removeFile(mockFile.filePath);
        });

        it("marks hasViolation as false if no edges contain the node", async () => {
            const mockFile: FileStorage = {
                filePath: "src/entities/Clean.java",
                fileType: "java",
                layer: "enterpriseBusinessRules",
                node: "entities",
            };
            genericDBAccess.upsertFile(mockFile);

            const outputData = makeOutputData();
            const interactor = new GetFileTreeInteractor(genericDBAccess, outputData);

            await interactor.getFileTree();

            const entitiesDir = outputData.result?.children?.find(c => c.name === "entities");
            const fileNode = entitiesDir?.children?.[0];

            expect(fileNode?.hasViolation).toBe(false);

            genericDBAccess.removeFile(mockFile.filePath);
        });
    });
});
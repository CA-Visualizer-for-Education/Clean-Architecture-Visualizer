import { GetRelationsInteractor } from "../../../src/use_case/getRelations/GetRelationsInteractor.js";
import { SessionDBAccess } from "../../../src/data_access/sessionDBAccess.js";
import { FileAccess } from "../../../src/data_access/fileAccess.js";
import type { GetRelationsInputData } from "../../../src/use_case/getRelations/GetRelationsInputData.js";
import type { GetRelationsOutputData } from "../../../src/use_case/getRelations/GetRelationsOutputData.js";

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const genericDBAccess = new SessionDBAccess();
const genericFileAccess = new FileAccess();

function makeInputData(filePath: string): GetRelationsInputData {
    return {
        getFilePath: () => filePath,
    } as unknown as GetRelationsInputData;
}

function makeOutputData(): GetRelationsOutputData & { result: any } {
    return {
        result: undefined,
        setOutputData(data: any) { this.result = data; },
        getOutputData() { return this.result; }
    } as GetRelationsOutputData & { result: any };
}

describe("GetRelationsInteractor", () => {

    beforeEach(() => {
        genericDBAccess.resetDB();
        // Mocking FileAccess methods to prevent actual disk I/O during logic tests
        jest.spyOn(genericFileAccess, 'getFileContent').mockImplementation(async () => "");
        jest.spyOn(genericFileAccess, 'getFileImports').mockImplementation(async () => []);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("execute — Java Relation Detection", () => {

        const targetPath = "src/entities/User.java";
        const referrerPath = "src/use_case/UserInteractor.java";

        beforeEach(() => {
            genericDBAccess.upsertFile({
                filePath: targetPath,
                fileType: "java",
                layer: "enterpriseBusinessRules",
                node: "entities"
            });
            genericDBAccess.upsertFile({
                filePath: referrerPath,
                fileType: "java",
                layer: "applicationBusinessRules",
                node: "useCaseInteractor"
            });
        });

        it("detects an INSTANTIATION relation", async () => {
            jest.spyOn(genericFileAccess, 'getFileContent').mockResolvedValue(
                "public void create() {\n  User user = new User();\n}"
            );

            const outputData = makeOutputData();
            const interactor = new GetRelationsInteractor(
                genericDBAccess, genericFileAccess, makeInputData(targetPath), outputData
            );

            await interactor.execute();

            const relation = outputData.result.relations[0];
            expect(relation.type).toBe("INSTANTIATION");
            expect(relation.line).toBe(2);
            expect(relation.file).toBe(referrerPath);
        });

        it("detects a PARAMETER_PASS relation", async () => {
            jest.spyOn(genericFileAccess, 'getFileContent').mockResolvedValue(
                "public void execute(User user) {\n  // code\n}"
            );

            const outputData = makeOutputData();
            const interactor = new GetRelationsInteractor(
                genericDBAccess, genericFileAccess, makeInputData(targetPath), outputData
            );

            await interactor.execute();

            expect(outputData.result.relations[0].type).toBe("PARAMETER_PASS");
        });

        it("detects an IMPORT relation", async () => {
            jest.spyOn(genericFileAccess, 'getFileContent').mockResolvedValue(
                "import entities.User;\n\npublic class Interactor {}"
            );

            const outputData = makeOutputData();
            const interactor = new GetRelationsInteractor(
                genericDBAccess, genericFileAccess, makeInputData(targetPath), outputData
            );

            await interactor.execute();

            expect(outputData.result.relations[0].type).toBe("IMPORT");
            expect(outputData.result.relations[0].line).toBe(1);
        });
    });

    describe("execute — Non-Java Relation Detection", () => {

        it("detects relations in TypeScript files without line numbers or types", async () => {
            const targetPath = "src/entities/User.ts";
            const tsReferrer = "src/controller/UserController.ts";

            genericDBAccess.upsertFile({ filePath: targetPath, fileType: "not_java", layer: "entities", node: "node" });
            genericDBAccess.upsertFile({ filePath: tsReferrer, fileType: "not_java", layer: "interfaceAdapters", node: "node" });

            // Mock getFileImports to return a match for "User"
            jest.spyOn(genericFileAccess, 'getFileImports').mockResolvedValue([
                "../../entities/User.js"
            ]);

            const outputData = makeOutputData();
            const interactor = new GetRelationsInteractor(
                genericDBAccess, genericFileAccess, makeInputData(targetPath), outputData
            );

            await interactor.execute();

            const relation = outputData.result.relations[0];
            expect(relation.file).toBe(tsReferrer);
            expect(relation.type).toBe(""); // Requirement: omit type for non-java
            expect(relation.line).toBeUndefined(); // Requirement: omit line for non-java
        });
    });

    describe("execute — Edge Cases", () => {

        it("ignores the target file itself even if it contains its own name", async () => {
            const path = "src/entities/User.java";
            genericDBAccess.upsertFile({ filePath: path, fileType: "java", layer: "entities", node: "node" });
            
            jest.spyOn(genericFileAccess, 'getFileContent').mockResolvedValue("public class User { User() {} }");

            const outputData = makeOutputData();
            const interactor = new GetRelationsInteractor(
                genericDBAccess, genericFileAccess, makeInputData(path), outputData
            );

            await interactor.execute();

            expect(outputData.result.relations).toHaveLength(0);
        });
    });
});
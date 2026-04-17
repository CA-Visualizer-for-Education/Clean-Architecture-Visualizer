import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { InitProjectInteractor } from "../../../src/use_case/initProject/initProjectInteractor.js";
import type { FileAccessInterface } from "../../../src/data_access/fileAccessInterface.js";
import type { InitProjectOutputData } from "../../../src/use_case/initProject/initProjectOutputData.js";

describe("InitProjectInteractor", () => {
    let mockFileAccess: jest.Mocked<FileAccessInterface>;
    let mockOutputData: jest.Mocked<InitProjectOutputData>;
    let interactor: InitProjectInteractor;

    const ROOT_PATH = "/project/root";

    beforeEach(() => {
        // Setup Mocks
        mockFileAccess = {
            getCurrentPath: jest.fn<any>(),
            createDirectory: jest.fn<any>(),
            // These aren't used in InitProject but are part of the interface
            bfsFindDir: jest.fn<any>(),
            createFile: jest.fn<any>(),
        } as any;

        mockOutputData = {
            setOutputData: jest.fn<any>(),
        } as any;

        interactor = new InitProjectInteractor(mockFileAccess, mockOutputData);
    });

    it("successfully creates the entire Clean Architecture directory structure", async () => {
        // Arrange
        mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);

        // Act
        await interactor.execute();

        // Assert
        const expectedDirs = [
            `${ROOT_PATH}/src/main/java`,
            `${ROOT_PATH}/src/test/java`,
            `${ROOT_PATH}/src/main/java/app`,
            `${ROOT_PATH}/src/main/java/use_case`,
            `${ROOT_PATH}/src/main/java/entity`,
            `${ROOT_PATH}/src/main/java/interface_adapter`,
            `${ROOT_PATH}/src/main/java/data_access`,
            `${ROOT_PATH}/src/main/java/view`
        ];

        // Check that each directory was called
        expectedDirs.forEach(dir => {
            expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
        });

        // Verify total number of calls matches the number of directories
        expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(expectedDirs.length);
        
        // Verify success signal
        expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
    });

    it("sets output data to false if the file system fails", async () => {
        // Arrange
        mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
        // Force an error on one of the directory creations
        mockFileAccess.createDirectory.mockRejectedValue(new Error("Permission denied"));

        // Act
        await interactor.execute();

        // Assert
        expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    });

    it("correctly handles errors if getCurrentPath fails", async () => {
        // Arrange
        mockFileAccess.getCurrentPath.mockRejectedValue(new Error("Path unknown"));

        // Act
        await interactor.execute();

        // Assert
        expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
        expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
    });
});
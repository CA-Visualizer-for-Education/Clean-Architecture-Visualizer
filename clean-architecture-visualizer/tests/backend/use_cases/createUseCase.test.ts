import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CreateUseCaseinteractor } from "../../../src/use_case/createUseCase/createUseCaseInteractor.js";
import type { FileAccessInterface } from "../../../src/data_access/fileAccessInterface.js";
import type { CreateUseCaseInputData } from "../../../src/use_case/createUseCase/createUseCaseInputData.js";
import type { CreateUseCaseOutputData } from "../../../src/use_case/createUseCase/createUseCaseOutputData.js";

describe("CreateUseCaseInteractor", () => {
    let mockFileAccess: jest.Mocked<FileAccessInterface>;
    let mockInputData: jest.Mocked<CreateUseCaseInputData>;
    let mockOutputData: jest.Mocked<CreateUseCaseOutputData>;
    let interactor: CreateUseCaseinteractor;

    beforeEach(() => {
        // Setup Mocks
        mockFileAccess = {
            getCurrentPath: jest.fn<any>(),
            bfsFindDir: jest.fn<any>(),
            createDirectory: jest.fn<any>(),
            createFile: jest.fn<any>(),
        } as any;

        mockInputData = {
            getUseCaseName: jest.fn<any>(),
        } as any;

        mockOutputData = {
            setOutputData: jest.fn<any>(),
        } as any;

        interactor = new CreateUseCaseinteractor(mockFileAccess, mockInputData, mockOutputData);
    });

    it("successfully creates directories and files for a valid use case name", async () => {
        // Arrange
        mockInputData.getUseCaseName.mockReturnValue("Login User");
        mockFileAccess.getCurrentPath.mockResolvedValue("/root");
        mockFileAccess.bfsFindDir.mockImplementation(async (path, dirName) => `/root/src/${dirName}`);

        // Act
        await interactor.execute();

        // Assert
        // Check if name was cleaned (spaces removed)
        const expectedName = "LoginUser";
        
        // Verify directory creation
        expect(mockFileAccess.createDirectory).toHaveBeenCalledWith("/root/src/use_case/LoginUser");
        expect(mockFileAccess.createDirectory).toHaveBeenCalledWith("/root/src/interface_adapter/LoginUser");

        // Verify key files were created
        expect(mockFileAccess.createFile).toHaveBeenCalledWith(expect.stringContaining("LoginUserInputBoundary.java"));
        expect(mockFileAccess.createFile).toHaveBeenCalledWith(expect.stringContaining("LoginUserController.java"));
        
        // Verify success signal
        expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
    });

    it("fails and sets output data to false if directories are not found", async () => {
        // Arrange
        mockInputData.getUseCaseName.mockReturnValue("Test");
        mockFileAccess.getCurrentPath.mockResolvedValue("/root");
        // Simulate missing directory
        mockFileAccess.bfsFindDir.mockResolvedValue(null);

        // Act
        await interactor.execute();

        // Assert
        expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
        // Ensure no files were attempted to be created
        expect(mockFileAccess.createFile).not.toHaveBeenCalled();
    });

    it("fails if an unexpected error occurs during file creation", async () => {
        // Arrange
        mockInputData.getUseCaseName.mockReturnValue("Test");
        mockFileAccess.getCurrentPath.mockResolvedValue("/root");
        mockFileAccess.bfsFindDir.mockResolvedValue("/root/dir");
        mockFileAccess.createFile.mockRejectedValue(new Error("Disk Full"));

        // Act
        await interactor.execute();

        // Assert
        expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    });
});
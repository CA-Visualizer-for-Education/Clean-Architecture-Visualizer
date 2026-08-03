import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { InitProjectInteractor } from '../../../src/use_case/initProject/initProjectInteractor.js';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';
import type { InitProjectOutputData } from '../../../src/use_case/initProject/initProjectOutputData.js';
import { InitProjectInputData } from '../../../src/use_case/initProject/initProjectInputData.js';

describe('InitProjectInteractor', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  let mockOutputData: jest.Mocked<InitProjectOutputData>;

  const ROOT_PATH = '/project/root';

  beforeEach(() => {
    // Setup Mocks
    mockFileAccess = {
      getCurrentPath: jest.fn<any>(),
      createDirectory: jest.fn<any>(),
      // These aren't used in InitProject but are part of the interface
      bfsFindDir: jest.fn<any>(),
      createFile: jest.fn<any>(),
      exists: jest.fn<any>(),
    } as any;

    mockOutputData = {
      setOutputData: jest.fn<any>(),
    } as any;
  });

  function makeInteractor(language: string) {
    return new InitProjectInteractor(
      mockFileAccess,
      new InitProjectInputData(language),
      mockOutputData
    );
  }

  it('successfully creates the entire Clean Architecture directory structure in java', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.exists.mockResolvedValue(true);

    // Act
    await makeInteractor('java').execute();

    // Assert
    const expectedDirs = [
      `${ROOT_PATH}/src/main/java`,
      `${ROOT_PATH}/src/test/java`,
      `${ROOT_PATH}/src/main/java/app`,
      `${ROOT_PATH}/src/main/java/use_case`,
      `${ROOT_PATH}/src/main/java/entity`,
      `${ROOT_PATH}/src/main/java/interface_adapter`,
      `${ROOT_PATH}/src/main/java/data_access`,
      `${ROOT_PATH}/src/main/java/database`,
      `${ROOT_PATH}/src/main/java/view`,
    ];

    // Check that each directory was called
    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    // Verify total number of calls matches the number of directories
    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length
    );

    // Verify success signal
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('successfully creates the entire Clean Architecture directory structure in python', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.exists.mockResolvedValue(true);

    // Act
    await makeInteractor('python').execute();

    // Assert
    const expectedDirs = [
      `${ROOT_PATH}/src/main/python`,
      `${ROOT_PATH}/src/test/python`,
      `${ROOT_PATH}/src/main/python/app`,
      `${ROOT_PATH}/src/main/python/use_case`,
      `${ROOT_PATH}/src/main/python/entity`,
      `${ROOT_PATH}/src/main/python/interface_adapter`,
      `${ROOT_PATH}/src/main/python/data_access`,
      `${ROOT_PATH}/src/main/python/database`,
      `${ROOT_PATH}/src/main/python/view`,
    ];

    // Check that each directory was called
    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    // Verify total number of calls matches the number of directories
    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length
    );

    // Verify success signal
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('successfully creates the entire Clean Architecture directory structure in javascript', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.exists.mockResolvedValue(true);

    // Act
    await makeInteractor('Javascript').execute();

    // Assert
    const expectedDirs = [
      `${ROOT_PATH}/src/main/javascript`,
      `${ROOT_PATH}/src/test/javascript`,
      `${ROOT_PATH}/src/main/javascript/app`,
      `${ROOT_PATH}/src/main/javascript/use_case`,
      `${ROOT_PATH}/src/main/javascript/entity`,
      `${ROOT_PATH}/src/main/javascript/interface_adapter`,
      `${ROOT_PATH}/src/main/javascript/data_access`,
      `${ROOT_PATH}/src/main/javascript/database`,
      `${ROOT_PATH}/src/main/javascript/view`,
    ];

    // Check that each directory was called
    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    // Verify total number of calls matches the number of directories
    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length
    );

    // Verify success signal
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('successfully creates the entire Clean Architecture directory structure in typescript', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.exists.mockResolvedValue(true);

    // Act
    await makeInteractor('typescript').execute();

    // Assert
    const expectedDirs = [
      `${ROOT_PATH}/src/main/typescript`,
      `${ROOT_PATH}/src/test/typescript`,
      `${ROOT_PATH}/src/main/typescript/app`,
      `${ROOT_PATH}/src/main/typescript/use_case`,
      `${ROOT_PATH}/src/main/typescript/entity`,
      `${ROOT_PATH}/src/main/typescript/interface_adapter`,
      `${ROOT_PATH}/src/main/typescript/data_access`,
      `${ROOT_PATH}/src/main/typescript/database`,
      `${ROOT_PATH}/src/main/typescript/view`,
    ];

    // Check that each directory was called
    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    // Verify total number of calls matches the number of directories
    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length
    );

    // Verify success signal
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('sets output data to false if the file system fails', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    // Force an error on one of the directory creations
    mockFileAccess.createDirectory.mockRejectedValue(
      new Error('Permission denied')
    );

    // Act
    await makeInteractor('java').execute();

    // Assert
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });

  it('correctly handles errors if getCurrentPath fails', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockRejectedValue(new Error('Path unknown'));

    // Act
    await makeInteractor('java').execute();

    // Assert
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });

  it('should fail if already initialized', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.exists.mockResolvedValue(true);
    mockFileAccess.bfsFindDir.mockResolvedValue(`${ROOT_PATH}/src/main`);

    // Act
    await makeInteractor('java').execute();

    // Assert
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });

  it('Error occurs because src directory does not exist.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.exists.mockResolvedValue(false);
    await makeInteractor('java').execute();
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });

  it('Error occurs because programming language is invalid..', async () => {
    await makeInteractor('blah blah blah').execute();
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });
});

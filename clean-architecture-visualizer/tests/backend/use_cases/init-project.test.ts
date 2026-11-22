import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';
import { InitProjectInputData } from '../../../src/use_case/initProject/initProjectInputData.js';
import { InitProjectInteractor } from '../../../src/use_case/initProject/initProjectInteractor.js';
import { InitProjectOutputData } from '../../../src/use_case/initProject/initProjectOutputData.js';
import { makeMockFileAccess } from '../doubles/mock-file-access.js';

describe('InitProjectInteractor', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  let mockOutputData: InitProjectOutputData;

  const rootPath = '/project/root';

  beforeEach(() => {
    // Setup Mocks
    mockFileAccess = makeMockFileAccess();

    mockOutputData = new InitProjectOutputData();
    jest.spyOn(mockOutputData, 'setOutputData');
  });

  function runInteractor(language: string) {
    const interactor = new InitProjectInteractor(
      mockFileAccess,
      mockOutputData
    );
    return interactor.execute(new InitProjectInputData(language));
  }

  it('successfully creates the entire Clean Architecture directory structure in java', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(true);

    // Act
    await runInteractor('java');

    // Assert
    const expectedDirs = [
      `${rootPath}/src/main/java`,
      `${rootPath}/src/test/java`,
      `${rootPath}/src/main/java/app`,
      `${rootPath}/src/main/java/use_case`,
      `${rootPath}/src/main/java/entity`,
      `${rootPath}/src/main/java/interface_adapter`,
      `${rootPath}/src/main/java/data_access`,
      `${rootPath}/src/main/java/database`,
      `${rootPath}/src/main/java/view`,
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
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(true);

    // Act
    await runInteractor('python');

    // Assert
    const expectedDirs = [
      `${rootPath}/src/main/python`,
      `${rootPath}/src/test/python`,
      `${rootPath}/src/main/python/app`,
      `${rootPath}/src/main/python/use_case`,
      `${rootPath}/src/main/python/entity`,
      `${rootPath}/src/main/python/interface_adapter`,
      `${rootPath}/src/main/python/data_access`,
      `${rootPath}/src/main/python/database`,
      `${rootPath}/src/main/python/view`,
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
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(true);

    // Act
    await runInteractor('javascript');

    // Assert
    const expectedDirs = [
      `${rootPath}/src/main/javascript`,
      `${rootPath}/src/test/javascript`,
      `${rootPath}/src/main/javascript/app`,
      `${rootPath}/src/main/javascript/use_case`,
      `${rootPath}/src/main/javascript/entity`,
      `${rootPath}/src/main/javascript/interface_adapter`,
      `${rootPath}/src/main/javascript/data_access`,
      `${rootPath}/src/main/javascript/database`,
      `${rootPath}/src/main/javascript/view`,
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
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(true);

    // Act
    await runInteractor('typescript');

    // Assert
    const expectedDirs = [
      `${rootPath}/src/main/typescript`,
      `${rootPath}/src/test/typescript`,
      `${rootPath}/src/main/typescript/app`,
      `${rootPath}/src/main/typescript/use_case`,
      `${rootPath}/src/main/typescript/entity`,
      `${rootPath}/src/main/typescript/interface_adapter`,
      `${rootPath}/src/main/typescript/data_access`,
      `${rootPath}/src/main/typescript/database`,
      `${rootPath}/src/main/typescript/view`,
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
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    // Force an error on one of the directory creations
    mockFileAccess.createDirectory.mockRejectedValue(
      new Error('Permission denied')
    );

    // Act
    await runInteractor('java');

    // Assert
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });

  it('correctly handles errors if getCurrentPath fails', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockRejectedValue(new Error('Path unknown'));

    // Act
    await runInteractor('java');

    // Assert
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });

  it('should fail if already initialized', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(true);
    mockFileAccess.bfsFindDir.mockResolvedValue(`${rootPath}/src/main`);

    // Act
    await runInteractor('java');

    // Assert
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });

  it('Error occurs because src directory does not exist.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(false);
    await runInteractor('java');
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });

  it('Error occurs because programming language is invalid..', async () => {
    await runInteractor('blah blah blah');
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });
});

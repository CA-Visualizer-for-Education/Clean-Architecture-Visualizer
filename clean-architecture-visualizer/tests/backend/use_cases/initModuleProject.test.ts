import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';
import { InitModuleProjectInputData } from '../../../src/use_case/initModuleProject/initModuleProjectInputData.js';
import { InitModuleProjectInteractor } from '../../../src/use_case/initModuleProject/initModuleProjectInteractor.js';
import { InitModuleProjectOutputData } from '../../../src/use_case/initModuleProject/initModuleProjectOutputData.js';
import { makeMockFileAccess } from '../doubles/mock-file-access.js';

describe('InitModuleProjectInteractor', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  let mockOutputData: InitModuleProjectOutputData;

  const rootPath = '/project/root';
  beforeEach(() => {
    // Not testing file access, so we give mock values and implementations
    mockFileAccess = makeMockFileAccess();

    mockOutputData = new InitModuleProjectOutputData();
    jest.spyOn(mockOutputData, 'setOutputData');
  });

  function runInteractor(language: string) {
    const interactor = new InitModuleProjectInteractor(
      mockFileAccess,
      mockOutputData
    );
    return interactor.execute(new InitModuleProjectInputData(language));
  }

  it('Creates CA directory that is packaged by module (src exists) in java.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(true);
    await runInteractor('Java');

    const expectedDirs = [
      `${rootPath}/src/main/java`,
      `${rootPath}/src/test/java`,
      `${rootPath}/src/main/java/features`,
      `${rootPath}/src/main/java/data_access`,
      `${rootPath}/src/main/java/entity`,
      `${rootPath}/src/main/java/app`,
      `${rootPath}/src/main/java/views`,
      `${rootPath}/src/main/java/database`,
    ];

    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length
    );

    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('Creates CA directory that is packaged by module (src exists) in python.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(true);
    await runInteractor('python');

    const expectedDirs = [
      `${rootPath}/src/main/python`,
      `${rootPath}/src/test/python`,
      `${rootPath}/src/main/python/features`,
      `${rootPath}/src/main/python/data_access`,
      `${rootPath}/src/main/python/entity`,
      `${rootPath}/src/main/python/app`,
      `${rootPath}/src/main/python/views`,
      `${rootPath}/src/main/python/database`,
    ];

    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length
    );

    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('Creates CA directory that is packaged by module (src exists) in javascript.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(true);
    await runInteractor('javascript');

    const expectedDirs = [
      `${rootPath}/src/main/javascript`,
      `${rootPath}/src/test/javascript`,
      `${rootPath}/src/main/javascript/features`,
      `${rootPath}/src/main/javascript/data_access`,
      `${rootPath}/src/main/javascript/entity`,
      `${rootPath}/src/main/javascript/app`,
      `${rootPath}/src/main/javascript/views`,
      `${rootPath}/src/main/javascript/database`,
    ];

    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length
    );

    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('Creates CA directory that is packaged by module (src exists) in typescript.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(true);
    await runInteractor('typescript');

    const expectedDirs = [
      `${rootPath}/src/main/typescript`,
      `${rootPath}/src/test/typescript`,
      `${rootPath}/src/main/typescript/features`,
      `${rootPath}/src/main/typescript/data_access`,
      `${rootPath}/src/main/typescript/entity`,
      `${rootPath}/src/main/typescript/app`,
      `${rootPath}/src/main/typescript/views`,
      `${rootPath}/src/main/typescript/database`,
    ];

    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length
    );

    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('Error occurs because the programming language is invalid.', async () => {
    await runInteractor('blah blah blah');
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });

  it('Error occurs because src directory does not exist.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.exists.mockResolvedValue(false);
    await runInteractor('java');
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });

  it('Sets output to false if the file system fails.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.createDirectory.mockRejectedValue(
      new Error('Permission denied')
    );

    await runInteractor('java');
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });

  it('Handles errors if getCurrentPath fails.', async () => {
    mockFileAccess.getCurrentPath.mockRejectedValue(new Error('Path unknown'));
    await runInteractor('java');

    // Assert
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });

  it('Sets output to false if main directory exists (project already initialized).', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.bfsFindDir.mockResolvedValue(`${rootPath}/src/main`);
    mockFileAccess.exists.mockResolvedValue(true);

    await runInteractor('java');
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });

  it('Sets output to false if test directory exists (project already initialized).', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(rootPath);
    mockFileAccess.bfsFindDir.mockResolvedValue(`${rootPath}/src/test`);
    mockFileAccess.exists.mockResolvedValue(true);

    await runInteractor('java');
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });
});

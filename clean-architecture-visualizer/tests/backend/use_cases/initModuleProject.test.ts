import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';
import type { InitModuleProjectOutputData } from '../../../src/use_case/initModuleProject/initModuleProjectOutputData.js';
import { InitModuleProjectInteractor } from '../../../src/use_case/initModuleProject/initModuleProjectInteractor.js';

describe('InitModuleProjectInteractor', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  let mockOutputData: jest.Mocked<InitModuleProjectOutputData>;
  let interactor: InitModuleProjectInteractor;

  const ROOT_PATH = '/project/root';
  beforeEach(() => {
    // Not testing file access, so we give mock values and implementations
    mockFileAccess = {
      getCurrentPath: jest.fn<any>(),
      createDirectory: jest.fn<any>(),
      bfsFindDir: jest.fn<any>(),
      createFile: jest.fn<any>(),
      exists: jest.fn<any>(),
    } as any;

    mockOutputData = {
      setOutputData: jest.fn<any>(),
    } as any;

    interactor = new InitModuleProjectInteractor(
      mockFileAccess,
      mockOutputData
    );
  });

  it('Creates CA directory that is packaged by module (src exists).', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.exists.mockResolvedValue(true);
    await interactor.execute();

    const expectedDirs = [
      `${ROOT_PATH}/src/main/java`,
      `${ROOT_PATH}/src/test/java`,
      `${ROOT_PATH}/src/main/java/features`,
      `${ROOT_PATH}/src/main/java/data_access`,
      `${ROOT_PATH}/src/main/java/entity`,
      `${ROOT_PATH}/src/main/java/app`,
      `${ROOT_PATH}/src/main/java/views`,
    ];

    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length
    );

    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('Creates CA directory that is packaged by module (src does not exist).', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.exists.mockResolvedValue(false);
    await interactor.execute();

    const expectedDirs = [
      `${ROOT_PATH}/src/main/java`,
      `${ROOT_PATH}/src/test/java`,
      `${ROOT_PATH}/src/main/java/features`,
      `${ROOT_PATH}/src/main/java/data_access`,
      `${ROOT_PATH}/src/main/java/entity`,
      `${ROOT_PATH}/src/main/java/app`,
      `${ROOT_PATH}/src/main/java/views`,
    ];

    expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(
      `${ROOT_PATH}/src`
    );
    expectedDirs.forEach((dir) => {
      expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(dir);
    });

    expect(mockFileAccess.createDirectory).toHaveBeenCalledTimes(
      expectedDirs.length + 1
    );

    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(true);
  });

  it('Sets output to false if the file system fails.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.createDirectory.mockRejectedValue(
      new Error('Permission denied')
    );

    await interactor.execute();
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
  });

  it('Handles errors if getCurrentPath fails.', async () => {
    mockFileAccess.getCurrentPath.mockRejectedValue(new Error('Path unknown'));
    await interactor.execute();

    // Assert
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });

  it('Sets output to false if main directory exists (project already initialized).', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.bfsFindDir.mockResolvedValue(`${ROOT_PATH}/src/main`);
    mockFileAccess.exists.mockResolvedValue(true);

    await interactor.execute();
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });

  it('Sets output to false if test directory exists (project already initialized).', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue(ROOT_PATH);
    mockFileAccess.bfsFindDir.mockResolvedValue(`${ROOT_PATH}/src/test`);
    mockFileAccess.exists.mockResolvedValue(true);

    await interactor.execute();
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith(false);
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });
});

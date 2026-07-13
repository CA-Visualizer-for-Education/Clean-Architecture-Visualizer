import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';
import { CreateUseCaseInputData } from '../../../src/use_case/createUseCase/createUseCaseInputData.js';
import { CreateUseCaseOutputData } from '../../../src/use_case/createUseCase/createUseCaseOutputData.js';
import { CreateUseCaseInteractor } from '../../../src/use_case/createUseCase/createUseCaseInteractor.js';
import type { CreateUseCaseOutputBoundary } from '../../../src/use_case/createUseCase/createUseCaseOutputBoundary.js';

describe('CreateUseCaseInteractor', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  let mockPresenter: jest.Mocked<CreateUseCaseOutputBoundary>;
  let interactor: CreateUseCaseInteractor;

  beforeEach(() => {
    // Setup Mocks
    mockFileAccess = {
      getCurrentPath: jest.fn<any>(),
      bfsFindDir: jest.fn<any>(),
      exists: jest.fn<any>(),
      createDirectory: jest.fn<any>(),
      createFile: jest.fn<any>(),
    } as any;

    mockPresenter = {
      showSuccessView: jest.fn<any>(),
      showFailView: jest.fn<any>(),
    } as any;

    interactor = new CreateUseCaseInteractor(mockFileAccess, mockPresenter);
  });

  // TODO: Add a separate test case checking if use case names with spaces wer properly sanitized

  it('successfully creates directories and files for a valid use case name', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    mockFileAccess.bfsFindDir.mockImplementation(
      async (path, dirName) => `/root/src/${dirName}`
    );

    // Act
    const inputData = new CreateUseCaseInputData('LoginUser');
    await interactor.execute(inputData);

    // Assert
    // Verify directory creation
    expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(
      '/root/src/use_case/LoginUser'
    );
    expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(
      '/root/src/interface_adapter/LoginUser'
    );

    // Verify key files were created
    expect(mockFileAccess.createFile).toHaveBeenCalledWith(
      expect.stringContaining('LoginUserInputBoundary.java')
    );
    expect(mockFileAccess.createFile).toHaveBeenCalledWith(
      expect.stringContaining('LoginUserController.java')
    );

    // Verify success signal
    expect(mockPresenter.showSuccessView).toHaveBeenCalledWith(
      new CreateUseCaseOutputData('LoginUser')
    );
    expect(mockPresenter.showFailView).not.toHaveBeenCalled();
  });

  it('fails and sets output data to false if directories are not found', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    // Simulate missing directory
    mockFileAccess.bfsFindDir.mockResolvedValue(null);

    // Act
    await interactor.execute(new CreateUseCaseInputData('Test'));

    // Assert
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalledWith(
      'Could not find use_case or interface_adapter, try initiating project first.'
    );
    // Ensure no files were attempted to be created
    expect(mockFileAccess.createFile).not.toHaveBeenCalled();
  });

  it('fails and sets output data to false if directories are already present', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    mockFileAccess.bfsFindDir.mockImplementation(
      async (path, dirName) => `/root/src/${dirName}`
    );
    // Simulate already existing directory
    mockFileAccess.exists.mockResolvedValue(true);

    // Act
    await interactor.execute(new CreateUseCaseInputData('Test'));

    // Assert
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalledWith(
      'Usecase Test already exists.'
    );
    // Ensure no files or directories were attempted to be created
    expect(mockFileAccess.createFile).not.toHaveBeenCalled();
    expect(mockFileAccess.createDirectory).not.toHaveBeenCalled();
  });

  it('fails if an unexpected error occurs during file creation', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    mockFileAccess.bfsFindDir.mockResolvedValue('/root/dir');
    mockFileAccess.createFile.mockRejectedValue(new Error('Disk Full'));

    // Act
    await interactor.execute(new CreateUseCaseInputData('Test'));

    // Assert
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalled();
  });
});

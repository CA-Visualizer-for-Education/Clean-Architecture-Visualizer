import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';
import { CreateModuleUseCaseInputData } from '../../../src/use_case/createModuleUseCase/createModuleUseCaseInputData.js';
import { CreateModuleUseCaseOutputData } from '../../../src/use_case/createModuleUseCase/createModuleUseCaseOutputData.js';
import { CreateModuleUseCaseInteractor } from '../../../src/use_case/createModuleUseCase/createModuleUseCaseInteractor.js';
import type { CreateModuleUseCaseOutputBoundary } from '../../../src/use_case/createModuleUseCase/createModuleUseCaseOutputBoundary.js';

describe('CreateFeatureInteractor', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  let mockPresenter: jest.Mocked<CreateModuleUseCaseOutputBoundary>;
  let interactor: CreateModuleUseCaseInteractor;

  beforeEach(() => {
    mockFileAccess = {
      getCurrentPath: jest.fn<any>(),
      bfsFindDir: jest.fn<any>(),
      createDirectory: jest.fn<any>(),
      createFile: jest.fn<any>(),
    } as any;

    mockPresenter = {
      showSuccessView: jest.fn<any>(),
      showFailView: jest.fn<any>(),
    } as any;

    interactor = new CreateModuleUseCaseInteractor(
      mockFileAccess,
      mockPresenter
    );
  });

  it('Successfully creates files in specified directories in specified use case in specified feature.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    // bfsFindDir runs twice and will need two different implementations
    // The first will find the features directory and the second will find the specific feature
    mockFileAccess.bfsFindDir
      .mockImplementationOnce(async (_, dirName) => `/root/src/${dirName}`)
      .mockImplementationOnce(
        async (_, dirName) => `/root/src/features/${dirName}`
      )
      .mockImplementationOnce(async (_, dirName) => null);
    const inputData = new CreateModuleUseCaseInputData(
      'newFeature',
      'newUseCase'
    );
    await interactor.execute(inputData);

    expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(
      '/root/src/features/newFeature/newUseCase/interface_adapter'
    );
    expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(
      '/root/src/features/newFeature/newUseCase/use_case'
    );
    expect(mockFileAccess.createFile).toHaveBeenCalledWith(
      expect.stringContaining('newUseCaseInputBoundary.java')
    );
    expect(mockFileAccess.createFile).toHaveBeenCalledWith(
      expect.stringContaining('newUseCaseController.java')
    );
    expect(mockFileAccess.createFile).toHaveBeenCalledTimes(7);

    expect(mockPresenter.showSuccessView).toHaveBeenCalledWith(
      new CreateModuleUseCaseOutputData('newFeature', 'newUseCase')
    );
    expect(mockPresenter.showFailView).not.toHaveBeenCalled();
  });

  it('Fails to create files because features directory does not exist.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    // bfsFindDir will only run once when trying to find features
    mockFileAccess.bfsFindDir.mockResolvedValue(null);
    const inputData = new CreateModuleUseCaseInputData(
      'newFeature',
      'newUseCase'
    );
    await interactor.execute(inputData);
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalledWith(
      'The features directory does not exist. Please initialize the project first.'
    );
  });

  it('Fails to create files because input feature does not exist.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    mockFileAccess.bfsFindDir
      .mockImplementationOnce(async (_, dirName) => `/root/src/${dirName}`)
      .mockImplementationOnce(async (_, dirName) => null);
    const inputData = new CreateModuleUseCaseInputData(
      'newFeature',
      'newUseCase'
    );
    await interactor.execute(inputData);
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalledWith(
      'The input feature does not exist in the features directory.'
    );
  });

  it('Fails to create files because use case already exists.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    mockFileAccess.bfsFindDir
      .mockImplementationOnce(async (_, dirName) => `/root/src/${dirName}`)
      .mockImplementationOnce(
        async (_, dirName) => `/root/src/features/${dirName}`
      )
      .mockImplementationOnce(
        async (_, dirName) => `/root/src/features/newFeature/${dirName}`
      );
    const inputData = new CreateModuleUseCaseInputData(
      'newFeature',
      'newUseCase'
    );
    await interactor.execute(inputData);
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalledWith(
      'The input usecase already exists.'
    );
  });
  it('Fails to create files because use case already exists in another directory.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    mockFileAccess.bfsFindDir
      .mockImplementationOnce(async (_, dirName) => `/root/src/${dirName}`)
      .mockImplementationOnce(
        async (_, dirName) => `/root/src/features/${dirName}`
      )
      .mockImplementationOnce(
        async (_, dirName) => `/root/src/features/blah/${dirName}`
      );
    const inputData = new CreateModuleUseCaseInputData(
      'newFeature',
      'newUseCase'
    );
    await interactor.execute(inputData);
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalledWith(
      'The input usecase already exists.'
    );
  });

  it('Fails if an unexpected error occurs during directory creation.', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    mockFileAccess.bfsFindDir
      .mockImplementationOnce(async (_, dirName) => `/root/src/${dirName}`)
      .mockImplementationOnce(
        async (_, dirName) => `/root/src/features/${dirName}`
      )
      .mockImplementationOnce(async (_, dirName) => null);
    mockFileAccess.createDirectory.mockRejectedValue(new Error('Disk Full'));
    await interactor.execute(
      new CreateModuleUseCaseInputData('newFeature', 'newUseCase')
    );
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalled();
  });

  it('Fails if an unexpected error occurs during file creation.', async () => {
    // Arrange
    mockFileAccess.getCurrentPath.mockResolvedValue('/root');
    mockFileAccess.bfsFindDir
      .mockImplementationOnce(async (_, dirName) => `/root/src/${dirName}`)
      .mockImplementationOnce(
        async (_, dirName) => `/root/src/features/${dirName}`
      )
      .mockImplementationOnce(async (_, dirName) => null);
    mockFileAccess.createFile.mockRejectedValue(
      new Error('Failed to create directory.')
    );
    await interactor.execute(
      new CreateModuleUseCaseInputData('newFeature', 'newUseCase')
    );
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalled();
  });
});

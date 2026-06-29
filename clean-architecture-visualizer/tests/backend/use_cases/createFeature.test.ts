import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';
import { CreateFeatureInputData } from '../../../src/use_case/createFeature/createFeatureInputData.js';
import { CreateFeatureOutputData } from '../../../src/use_case/createFeature/createFeatureOutputData.js';
import { CreateFeatureInteractor } from '../../../src/use_case/createFeature/createFeatureInteractor.js';
import type { CreateFeatureOutputBoundary } from '../../../src/use_case/createFeature/createFeatureOutputBoundary.js';

describe('CreateFeatureInteractor', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  let mockPresenter: jest.Mocked<CreateFeatureOutputBoundary>;
  let interactor: CreateFeatureInteractor;

  beforeEach(() => {
    mockFileAccess = {
      getCurrentPath: jest.fn<any>(),
      bfsFindDir: jest.fn<any>(),
      exists: jest.fn<any>(),
      createDirectory: jest.fn<any>(),
    } as any;

    mockPresenter = {
      showSuccessView: jest.fn<any>(),
      showFailView: jest.fn<any>(),
    } as any;

    interactor = new CreateFeatureInteractor(mockFileAccess, mockPresenter);
  });

  it('Successfully adds feature to features directory.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root/src');
    mockFileAccess.bfsFindDir.mockResolvedValue('/root/src/features');
    mockFileAccess.exists.mockResolvedValue(false);
    const inputData = new CreateFeatureInputData('new_feature');
    await interactor.execute(inputData);

    expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(
      '/root/src/features/new_feature'
    );

    expect(mockPresenter.showSuccessView).toHaveBeenCalledWith(
      new CreateFeatureOutputData('new_feature')
    );
    expect(mockPresenter.showFailView).not.toHaveBeenCalled();
  });

  it('Successfully adds feature to features directory that has space in name.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root/src');
    mockFileAccess.bfsFindDir.mockResolvedValue('/root/src/features');
    mockFileAccess.exists.mockResolvedValue(false);
    const inputData = new CreateFeatureInputData('new feature with spaces');
    await interactor.execute(inputData);

    expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(
      '/root/src/features/newfeaturewithspaces'
    );

    expect(mockPresenter.showSuccessView).toHaveBeenCalledWith(
      new CreateFeatureOutputData('newfeaturewithspaces')
    );
    expect(mockPresenter.showFailView).not.toHaveBeenCalled();
  });

  it('Fails to add feature because features directory does not exist.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root/src');
    mockFileAccess.bfsFindDir.mockResolvedValue(null);
    await interactor.execute(new CreateFeatureInputData('blah'));
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalled();
  });

  it('Fails to add feature that already exists.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root/src');
    mockFileAccess.bfsFindDir.mockResolvedValue('/root/src/features');
    mockFileAccess.exists.mockResolvedValue(true);
    const inputData = new CreateFeatureInputData('new_feature');
    await interactor.execute(inputData);
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalled();
  });

  it('Fails if unexpected error occurs during directory creation.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root/src');
    mockFileAccess.bfsFindDir.mockResolvedValue('/root/src/features');
    mockFileAccess.exists.mockResolvedValue(true);
    mockFileAccess.createDirectory.mockRejectedValue(
      new Error('Failed to create directory.')
    );
    const inputData = new CreateFeatureInputData('new_feature');
    await interactor.execute(inputData);
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalled();
  });
});

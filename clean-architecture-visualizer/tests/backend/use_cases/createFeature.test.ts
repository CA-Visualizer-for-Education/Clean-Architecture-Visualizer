import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { FileAccessInterface } from '../../../src/data_access/fileAccessInterface.js';
import { CreateFeatureInputData } from '../../../src/use_case/createFeature/createFeatureInputData.js';
import { CreateFeatureOutputData } from '../../../src/use_case/createFeature/createFeatureOutputData.js';
import { CreateFeatureInteractor } from '../../../src/use_case/createFeature/createFeatureInteractor.js';
import type { CreateFeatureOutputBoundary } from '../../../src/use_case/createFeature/createFeatureOutputBoundary.js';

describe('CreateFeatureInteractor', () => {
  let mockFileAccess: jest.Mocked<FileAccessInterface>;
  let mockPresenter: jest.Mocked<CreateFeatureOutputBoundary>;
  let outputData: CreateFeatureOutputData;

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

    outputData = new CreateFeatureOutputData();
  });

  function makeInteractor(name: string) {
    return new CreateFeatureInteractor(
      mockFileAccess,
      mockPresenter,
      new CreateFeatureInputData(name),
      outputData
    );
  }

  it('Successfully adds feature to features directory.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root/src');
    mockFileAccess.bfsFindDir.mockResolvedValue('/root/src/features');
    mockFileAccess.exists.mockResolvedValue(false);
    await makeInteractor('new_feature').execute();

    expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(
      '/root/src/features/new_feature'
    );

    expect(outputData.getFeature()).toBe('new_feature');
    expect(mockPresenter.showSuccessView).toHaveBeenCalled();
    expect(mockPresenter.showFailView).not.toHaveBeenCalled();
  });

  it('Successfully adds feature to features directory that has space in name.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root/src');
    mockFileAccess.bfsFindDir.mockResolvedValue('/root/src/features');
    mockFileAccess.exists.mockResolvedValue(false);
    await makeInteractor('new feature with spaces').execute();

    expect(mockFileAccess.createDirectory).toHaveBeenCalledWith(
      '/root/src/features/newfeaturewithspaces'
    );

    expect(outputData.getFeature()).toBe('newfeaturewithspaces');
    expect(mockPresenter.showSuccessView).toHaveBeenCalled();
    expect(mockPresenter.showFailView).not.toHaveBeenCalled();
  });

  it('Fails to add feature because features directory does not exist.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root/src');
    mockFileAccess.bfsFindDir.mockResolvedValue(null);
    await makeInteractor('blah').execute();
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalled();
  });

  it('Fails to add feature that already exists.', async () => {
    mockFileAccess.getCurrentPath.mockResolvedValue('/root/src');
    mockFileAccess.bfsFindDir.mockResolvedValue('/root/src/features');
    mockFileAccess.exists.mockResolvedValue(true);
    await makeInteractor('new_feature').execute();
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
    await makeInteractor('new_feature').execute();
    expect(mockPresenter.showSuccessView).not.toHaveBeenCalled();
    expect(mockPresenter.showFailView).toHaveBeenCalled();
  });
});

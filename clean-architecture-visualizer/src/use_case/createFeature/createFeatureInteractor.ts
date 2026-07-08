import path from 'node:path';
import type { FileAccessInterface } from '../../data_access/fileAccessInterface.js';
import type { CreateFeatureInputBoundary } from './createFeatureInputBoundary.js';
import type { CreateFeatureInputData } from './createFeatureInputData.js';
import type { CreateFeatureOutputBoundary } from './createFeatureOutputBoundary.js';
import { CreateFeatureOutputData } from './createFeatureOutputData.js';

export class CreateFeatureInteractor implements CreateFeatureInputBoundary {
  constructor(
    private readonly fileAccess: FileAccessInterface,
    private readonly presenter: CreateFeatureOutputBoundary
  ) {}

  async execute(inputData: CreateFeatureInputData) {
    try {
      // Want to remove all spaces from the name of the feature
      const feature = inputData.getFeatureName().split(' ').join('');
      const currPath = await this.fileAccess.getCurrentPath();
      // If "features" the directory doesn't exist, abort
      const featuresDirectory = await this.fileAccess.bfsFindDir(
        currPath,
        'features'
      );
      if (!featuresDirectory) {
        this.presenter.showFailView(
          'There is no features directory. Initialize the project first.'
        );
        return;
      }

      const targetFeaturePath = path.join(featuresDirectory, feature);
      if (await this.fileAccess.exists(targetFeaturePath)) {
        this.presenter.showFailView('This feature already exists.');
        return;
      }

      await this.fileAccess.createDirectory(targetFeaturePath);
      const createFeatureOutputData = new CreateFeatureOutputData(feature);
      this.presenter.showSuccessView(createFeatureOutputData);
    } catch (error) {
      if (error instanceof Error) {
        this.presenter.showFailView(error.message);
      }
    }
  }
}

import path from 'node:path';
import type { FileAccessInterface } from '../../data_access/fileAccessInterface.js';
import { UseCaseName } from '../../entity/useCaseName.js';
import type { CreateFeatureInputBoundary } from './createFeatureInputBoundary.js';
import type { CreateFeatureInputData } from './createFeatureInputData.js';
import type { CreateFeatureOutputBoundary } from './createFeatureOutputBoundary.js';
import type { CreateFeatureOutputData } from './createFeatureOutputData.js';

export class CreateFeatureInteractor implements CreateFeatureInputBoundary {
  constructor(
    private readonly fileAccess: FileAccessInterface,
    private readonly presenter: CreateFeatureOutputBoundary,
    private readonly outputData: CreateFeatureOutputData
  ) {}

  async execute(inputData: CreateFeatureInputData): Promise<void> {
    try {
      // Want to remove all spaces from the name of the feature
      const feature = new UseCaseName(inputData.getFeatureName()).value;
      const currPath = await this.fileAccess.getCurrentPath();
      // If "features" the directory doesn't exist in the main source, abort
      const sourcePath = (await this.fileAccess.getSourcePath()) ?? currPath;
      const featuresDirectory = await this.fileAccess.bfsFindDir(
        sourcePath,
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
      this.outputData.setFeature(feature);
      this.presenter.showSuccessView();
    } catch (error) {
      if (error instanceof Error) {
        this.presenter.showFailView(error.message);
      }
    }
  }
}

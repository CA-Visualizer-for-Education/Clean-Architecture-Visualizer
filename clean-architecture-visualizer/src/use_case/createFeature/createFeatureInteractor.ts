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
      await this.createFeature(inputData);
    } catch (error) {
      this.outputData.setError(
        error instanceof Error ? error.message : String(error)
      );
    }
    this.presenter.execute();
  }

  // Throws when the feature can't be created. execute catches every error
  // and records it in the output data.
  private async createFeature(
    inputData: CreateFeatureInputData
  ): Promise<void> {
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
      throw new Error(
        'There is no features directory. Initialize the project first.'
      );
    }

    const targetFeaturePath = path.join(featuresDirectory, feature);
    if (await this.fileAccess.exists(targetFeaturePath)) {
      throw new Error('This feature already exists.');
    }

    await this.fileAccess.createDirectory(targetFeaturePath);
    this.outputData.setFeature(feature);
  }
}

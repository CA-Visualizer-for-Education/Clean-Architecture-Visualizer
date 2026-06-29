import path from 'node:path';
import type { FileAccessInterface } from '../../data_access/fileAccessInterface.js';
import type { CreateModuleUseCaseInputBoundary } from './createModuleUseCaseInputBoundary.js';
import type { CreateModuleUseCaseInputData } from './createModuleUseCaseInputData.js';
import type { CreateModuleUseCaseOutputBoundary } from './createModuleUseCaseOutputBoundary.js';
import { CreateModuleUseCaseOutputData } from './createModuleUseCaseOutputData.js';

export class CreateModuleUseCaseInteractor implements CreateModuleUseCaseInputBoundary {
  constructor(
    private readonly fileAccess: FileAccessInterface,
    private readonly presenter: CreateModuleUseCaseOutputBoundary
  ) {}

  async execute(inputData: CreateModuleUseCaseInputData) {
    try {
      // remove all spaces from use case name and feature name
      const feature = inputData.getFeatureName().split(' ').join('');
      const usecase = inputData.getUseCaseName().split(' ').join('');
      // check if features directory exists
      const currPath = await this.fileAccess.getCurrentPath();
      const featuresDirectory = await this.fileAccess.bfsFindDir(
        currPath,
        'features'
      );
      if (!featuresDirectory) {
        this.presenter.showFailView(
          'The features directory does not exist. Please initialize the project first.'
        );
        return;
      }

      // check if feature exists
      const currFeatureDirectory = await this.fileAccess.bfsFindDir(
        featuresDirectory as string,
        feature
      );
      if (!currFeatureDirectory) {
        this.presenter.showFailView(
          'The input feature does not exist in the features directory.'
        );
        return;
      }

      // check if usecase already exists.
      if (await this.fileAccess.bfsFindDir(featuresDirectory, usecase)) {
        this.presenter.showFailView('The input usecase already exists.');
        return;
      }

      const useCasePath = path.join(currFeatureDirectory as string, usecase);
      // Create all directories
      await this.fileAccess.createDirectory(useCasePath);

      const iaPath = path.join(useCasePath, 'interface_adapter');
      await this.fileAccess.createDirectory(iaPath);
      const ucPath = path.join(useCasePath, 'use_case');
      await this.fileAccess.createDirectory(ucPath);

      // Create all files.
      const createJavaFile = async (dir: string, suffix: string) => {
        const fileName = `${usecase}${suffix}.java`;
        const fullPath = path.join(dir, fileName);
        return await this.fileAccess.createFile(fullPath);
      };

      const ucFiles = [
        'InputBoundary',
        'InputData',
        'Interactor',
        'OutputData',
        'OutputBoundary',
      ];

      for (const ucFile of ucFiles) {
        await createJavaFile(ucPath, ucFile);
      }

      await createJavaFile(iaPath, 'Controller');
      await createJavaFile(iaPath, 'Presenter');

      const outputData = new CreateModuleUseCaseOutputData(feature, usecase);
      this.presenter.showSuccessView(outputData);
    } catch (error) {
      if (error instanceof Error) {
        this.presenter.showFailView(error.message);
      }
    }
  }
}

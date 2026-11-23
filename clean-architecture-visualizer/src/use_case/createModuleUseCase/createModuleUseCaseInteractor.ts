import path from 'node:path';
import type { FileAccessInterface } from '../../data_access/fileAccessInterface.js';
import { UseCaseName } from '../../entity/useCaseName.js';
import type { CreateModuleUseCaseInputBoundary } from './createModuleUseCaseInputBoundary.js';
import type { CreateModuleUseCaseInputData } from './createModuleUseCaseInputData.js';
import type { CreateModuleUseCaseOutputBoundary } from './createModuleUseCaseOutputBoundary.js';
import type { CreateModuleUseCaseOutputData } from './createModuleUseCaseOutputData.js';

export class CreateModuleUseCaseInteractor
  implements CreateModuleUseCaseInputBoundary
{
  constructor(
    private readonly fileAccess: FileAccessInterface,
    private readonly presenter: CreateModuleUseCaseOutputBoundary,
    private readonly outputData: CreateModuleUseCaseOutputData
  ) {}

  async execute(inputData: CreateModuleUseCaseInputData): Promise<void> {
    try {
      await this.createModuleUseCase(inputData);
    } catch (error) {
      this.outputData.setError(
        error instanceof Error ? error.message : String(error)
      );
    }
    this.presenter.execute();
  }

  // Throws when the use case can't be created. execute catches every error
  // and records it in the output data.
  private async createModuleUseCase(
    inputData: CreateModuleUseCaseInputData
  ): Promise<void> {
    // remove all spaces from use case name and feature name
    const feature = new UseCaseName(inputData.getFeatureName()).value;
    const usecase = new UseCaseName(inputData.getUseCaseName()).value;
    const currPath = await this.fileAccess.getCurrentPath();
    // Find the language directory -- makes assumption only one directory is named after language
    let extension: string | undefined;
    const languageToExtension = new Map<string, string>([
      ['python', 'py'],
      ['java', 'java'],
      ['javascript', 'js'],
      ['typescript', 'ts'],
    ]);
    for (const [language, ext] of languageToExtension) {
      if (await this.fileAccess.bfsFindDir(currPath, language)) {
        extension = ext;
        break;
      }
    }

    if (extension === undefined) {
      throw new Error(
        'Your project does not have a specified programming language. You must create a directory that has the name: java, python, typescript, or javascript.'
      );
    }

    // check if features directory exists in the main source
    const sourcePath = (await this.fileAccess.getSourcePath()) ?? currPath;
    const featuresDirectory = await this.fileAccess.bfsFindDir(
      sourcePath,
      'features'
    );
    if (!featuresDirectory) {
      throw new Error(
        'The features directory does not exist. Please initialize the project first.'
      );
    }

    // check if feature exists
    const currFeatureDirectory = await this.fileAccess.bfsFindDir(
      featuresDirectory as string,
      feature
    );
    if (!currFeatureDirectory) {
      throw new Error(
        'The input feature does not exist in the features directory. Please choose a feature that does exist or create this feature.'
      );
    }

    // check if usecase already exists.
    if (await this.fileAccess.bfsFindDir(featuresDirectory, usecase)) {
      throw new Error(
        'The input usecase already exists. Please choose a different name.'
      );
    }

    const useCasePath = path.join(currFeatureDirectory as string, usecase);
    // Create all directories
    await this.fileAccess.createDirectory(useCasePath);

    const iaPath = path.join(useCasePath, 'interface_adapter');
    await this.fileAccess.createDirectory(iaPath);
    const ucPath = path.join(useCasePath, 'use_case');
    await this.fileAccess.createDirectory(ucPath);

    // Create all files.
    const createFile = async (dir: string, suffix: string) => {
      const fileName = `${usecase}${suffix}.${extension}`;
      const fullPath = path.join(dir, fileName);
      return await this.fileAccess.createFile(fullPath);
    };

    const ucFiles = [
      'InputBoundary',
      'InputData',
      'UseCaseInteractor',
      'OutputData',
      'OutputBoundary',
    ];

    for (const ucFile of ucFiles) {
      await createFile(ucPath, ucFile);
    }

    await createFile(iaPath, 'Controller');
    await createFile(iaPath, 'Presenter');

    this.outputData.setFeature(feature);
    this.outputData.setUseCase(usecase);
  }
}

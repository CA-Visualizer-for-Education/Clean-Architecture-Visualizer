import path from 'node:path';
import type { FileAccessInterface } from '../../data_access/fileAccessInterface.js';
import type { CreateUseCaseInputBoundary } from './createUseCaseInputBoundary.js';
import type { CreateUseCaseInputData } from './createUseCaseInputData.js';
import type { CreateUseCaseOutputBoundary } from './createUseCaseOutputBoundary.js';
import { CreateUseCaseOutputData } from './createUseCaseOutputData.js';

export class CreateUseCaseInteractor implements CreateUseCaseInputBoundary {
  constructor(
    private readonly fileAccess: FileAccessInterface,
    private readonly presenter: CreateUseCaseOutputBoundary
  ) {}

  async execute(createUseCaseInputData: CreateUseCaseInputData): Promise<void> {
    try {
      const useCaseName = createUseCaseInputData
        .getUseCaseName()
        .split(' ')
        .join('');
      const currPath = await this.fileAccess.getCurrentPath();

      // Find base directories
      const useCaseDir = await this.fileAccess.bfsFindDir(currPath, 'use_case');
      const interfaceAdapterDir = await this.fileAccess.bfsFindDir(
        currPath,
        'interface_adapter'
      );

      if (!useCaseDir || !interfaceAdapterDir) {
        this.presenter.showFailView(
          'Could not find use_case or interface_adapter, try initiating project first.'
        );
        return;
      }

      const targetUseCasePath = path.join(useCaseDir, useCaseName);
      const targetInterfacePath = path.join(interfaceAdapterDir, useCaseName);

      // Check if files already exist
      const useCaseExists = await this.fileAccess.exists(targetUseCasePath);
      const interfaceExists = await this.fileAccess.exists(targetInterfacePath);
      if (useCaseExists || interfaceExists) {
        this.presenter.showFailView(`Usecase ${useCaseName} already exists.`);
        return;
      }

      // Create use case
      await this.fileAccess.createDirectory(targetUseCasePath);
      await this.fileAccess.createDirectory(targetInterfacePath);

      const createJavaFile = async (dir: string, suffix: string) => {
        const fileName = `${useCaseName}${suffix}.java`;
        const fullPath = path.join(dir, fileName);
        return await this.fileAccess.createFile(fullPath);
      };

      // Use Case Layer Files
      await createJavaFile(targetUseCasePath, 'InputBoundary');
      await createJavaFile(targetUseCasePath, 'InputData');
      await createJavaFile(targetUseCasePath, 'Interactor');
      await createJavaFile(targetUseCasePath, 'OutputData');
      await createJavaFile(targetUseCasePath, 'OutputBoundary');

      // Interface Adapter Layer Files
      await createJavaFile(targetInterfacePath, 'Controller');
      await createJavaFile(targetInterfacePath, 'Presenter');

      const createUseCaseOutputData = new CreateUseCaseOutputData(useCaseName);
      this.presenter.showSuccessView(createUseCaseOutputData);
    } catch (error) {
      if (error instanceof Error) {
        this.presenter.showFailView(error.message);
      }
    }
  }
}

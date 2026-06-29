import type { FileAccessInterface } from '../../data_access/fileAccessInterface.js';
import type { InitModuleProjectInputBoundary } from './initModuleProjectInputBoundary.js';
import { InitModuleProjectOutputData } from './initModuleProjectOutputData.js';
import path from 'path';

export class InitModuleProjectInteractor implements InitModuleProjectInputBoundary {
  private readonly fileAccess: FileAccessInterface;
  private readonly outputData: InitModuleProjectOutputData;
  constructor(
    fileAccess: FileAccessInterface,
    outputData: InitModuleProjectOutputData = new InitModuleProjectOutputData()
  ) {
    this.fileAccess = fileAccess;
    this.outputData = outputData;
  }

  async execute(): Promise<void> {
    try {
      let currPath = await this.fileAccess.getCurrentPath();
      currPath = path.join(currPath, 'src');
      // Create the src directory if it does not exist.
      const res = await this.fileAccess.exists(currPath);
      if (!res) {
        await this.fileAccess.createDirectory(currPath);
      }
      // If main or test already exist, there is a chance the project has already been initialized
      if (
        (await this.fileAccess.bfsFindDir(currPath, 'main')) ||
        (await this.fileAccess.bfsFindDir(currPath, 'test'))
      ) {
        throw new Error('project already initialized.');
      }

      // The project does support TS, JS, Python, and Java, but will do Java for now for consistency
      const javaPath = path.join(currPath, 'main', 'java');
      const testPath = path.join(currPath, 'test', 'java');
      await this.fileAccess.createDirectory(javaPath);
      await this.fileAccess.createDirectory(testPath);

      // Create code structure for packaging by module.
      const subDirectories = [
        'features',
        'data_access',
        'entity',
        'app',
        'views',
      ];
      for (const directoryName of subDirectories) {
        await this.fileAccess.createDirectory(
          path.join(javaPath, directoryName)
        );
      }

      this.outputData.setOutputData(true);
    } catch (error) {
      console.error('Initialization failed:', error);
      this.outputData.setOutputData(false);
    }
  }
}

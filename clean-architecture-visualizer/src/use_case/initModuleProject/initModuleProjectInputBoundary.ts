import { InitModuleProjectInputData } from './initModuleProjectInputData.js';

export interface InitModuleProjectInputBoundary {
  execute(
    initModuleProjectInputData: InitModuleProjectInputData
  ): Promise<void>;
}

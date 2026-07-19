import { InitProjectInputData } from './initProjectInputData.js';

export interface InitProjectInputBoundary {
  execute(initProjectInputData: InitProjectInputData): Promise<void>;
}

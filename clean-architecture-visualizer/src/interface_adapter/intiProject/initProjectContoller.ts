import type { InitProjectInputBoundary } from "../../use_case/initProject/initProjectInputBoundary.js";

export class InitProjectContoller {
    constructor(
            private readonly inputBoundary: InitProjectInputBoundary
        ) {}
    
    async execute(): Promise<void> {
        await this.inputBoundary.execute();
    }
}
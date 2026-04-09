import type { InitProjectOutputBoundary } from "../../use_case/initProject/initProjectOutputBoundary.js";
import type { InitProjectOutputData } from "../../use_case/initProject/initProjectOutputData.js";

export class InitProjectPresetner implements InitProjectOutputBoundary {
    
    constructor(private readonly outputData: InitProjectOutputData) {}
    getOutputData(): boolean {
        return this.outputData.getOutputData();
    } 
}
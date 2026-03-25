import type { GetLearningModeInputBoundary } from "./getLearningModeInputBoundary.js";
import type { CleanArchInfoAccessInterface } from "../../data_access/cleanArchInfoAccessInterface.js";
import type { GetLearningModeOutputData } from "./getLearningModeOutputData.js";

export class GetLearningModeInteractor implements GetLearningModeInputBoundary {

    constructor(
            private readonly cleanArchAccess: CleanArchInfoAccessInterface,
            private readonly outputData: GetLearningModeOutputData
        ) {}

    async getLearningMode(): Promise<void> {
        let result: { [key: string]: any } = {}

        // populate output JSON response
        result.component_definitions = this.cleanArchAccess.getNodeInfo();
        result.layer_info = this.cleanArchAccess.getLayerInfo();

        this.outputData.setOutputData(result);
    }
}
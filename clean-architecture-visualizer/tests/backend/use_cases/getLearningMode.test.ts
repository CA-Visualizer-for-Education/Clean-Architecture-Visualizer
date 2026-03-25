import { describe, it, expect} from '@jest/globals';

import { GetLearningModeInteractor } from "../../../src/use_case/getLearningMode/getLearningModeInteractor.js";
import { CleanArchAccess } from "../../../src/data_access/cleanArchInfoAccess.js";
import type { GetLearningModeOutputData } from "../../../src/use_case/getLearningMode/getLearningModeOutputData.js";

const genericCleanArchAccess = new CleanArchAccess();

// Minimal mock for output data
function makeOutputData(): GetLearningModeOutputData & { result: any } {
    return {
        result: undefined,
        setOutputData(data: any) { this.result = data; }
    };
}

describe("GetLearningModeInteractor", () => {

    it("populates output data with both component definitions and layer info", async () => {
        const outputData = makeOutputData();
        const interactor = new GetLearningModeInteractor(genericCleanArchAccess, outputData);

        await interactor.getLearningMode();

        // Check for top-level keys
        expect(outputData.result).toHaveProperty("component_definitions");
        expect(outputData.result).toHaveProperty("layer_info");
    });

    it("correctly retrieves node descriptions in component_definitions", async () => {
        const outputData = makeOutputData();
        const interactor = new GetLearningModeInteractor(genericCleanArchAccess, outputData);

        await interactor.getLearningMode();

        // We expect the result of getNodeInfo() which maps node name -> description
        // Based on your JSON, 'controller' should have 'lorem ipsum'
        const definitions = await outputData.result.component_definitions;
        expect(definitions.controller).toBe("lorem ipsum");
        expect(definitions.entities).toBe("lorem ipsum");
    });

    it("correctly retrieves layer information", async () => {
        const outputData = makeOutputData();
        const interactor = new GetLearningModeInteractor(genericCleanArchAccess, outputData);

        await interactor.getLearningMode();

        // We expect the result of getLayerInfo() which maps layer name -> description
        const layerInfo = await outputData.result.layer_info;
        expect(layerInfo.interfaceAdapters).toBe("lorem ipsum");
        expect(layerInfo.enterpriseBusinessRules).toBe("lorem ipsum");
    });

    it("includes all expected layers in the output", async () => {
        const outputData = makeOutputData();
        const interactor = new GetLearningModeInteractor(genericCleanArchAccess, outputData);

        await interactor.getLearningMode();

        const layerInfo = await outputData.result.layer_info;
        const expectedLayers = [
            "interfaceAdapters",
            "frameworksAndDrivers",
            "enterpriseBusinessRules",
            "applicationBusinessRules"
        ];

        expectedLayers.forEach(layer => {
            expect(layerInfo).toHaveProperty(layer);
        });
    });
});
import { describe, it, expect, beforeEach} from '@jest/globals';
import { GetFilesWithViolationsInteractor } from "../../../src/use_case/getFilesWithViolations/getFilesWithViolationsInteractor.js";
import { SessionDBAccess } from "../../../src/data_access/sessionDBAccess.js";
import { useCaseGraph } from '../../../src/entity/useCaseGraph.js';
import type { GetFilesWithViolationsOutputData } from "../../../src/use_case/getFilesWithViolations/getFilesWithViolationsOutputData.js";
import type { SessionData } from '../../../src/types/sessionData.js';
import type { neighbourMap } from '../../../src/types/neighbourMap.js';
import type { cleanNode } from '../../../src/types/cleanNode.js';

const genericDBAccess = new SessionDBAccess();

// Standardized mock for Output Data matching your interface
function makeOutputData(): GetFilesWithViolationsOutputData & { result: any } {
    return {
        result: undefined,
        setOutputData(data: any) { this.result = data; },
        getOutputData() { return this.result; }
    } as GetFilesWithViolationsOutputData & { result: any };
}

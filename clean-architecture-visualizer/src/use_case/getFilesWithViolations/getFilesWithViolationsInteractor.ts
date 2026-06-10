import type { GetFilesWithViolationsInputBoundary} from "./getFilesWithViolationsInputBoundary.js"
import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { GetFilesWithViolationsOutputData } from "./getFilesWithViolationsOutputData.js";

export class GetFileswithViolationInteractor implements GetFilesWithViolationsInputBoundary {
    
    // new per session. construcing REQUIRES input of BOTH DBA and Output data (blank)
    constructor (
        private readonly db: SessionDBAccessInterface,
        private readonly outputdata: GetFilesWithViolationsOutputData,
    ){}

    async execute(): Promise<void> {

         // - getNodesByStatus("VIOLATION")
        const violatingNodes = this.db.getNodesByStatus("VIOLATION");

        // - map to filePaths
        const violatingNodesPaths = violatingNodes.map((node) => node.filePath);
        
        // - remove nodes with undefined filepatrhs
        const filteredViolatingNodePaths = violatingNodesPaths.filter((path): path is string => path != undefined)

        // - deduplicate with Set
        const uniqueNodesPaths = [...new Set(filteredViolatingNodePaths)];

        // - setOutputData({ total_violations, files })
        this.outputdata.setOutputData({ total_violations: violatingNodes.length, files: uniqueNodesPaths})
    }
}
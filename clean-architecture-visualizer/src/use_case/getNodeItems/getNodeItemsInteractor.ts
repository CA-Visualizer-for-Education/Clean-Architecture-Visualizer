import type { GetNodeItemsInputBoundary } from "./getNodeItemsInputBoundary.js";
import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { GetNodeItemsOutputData } from "./getNodeItemsOutputData.js";

export class GetNodeItemsInteractor implements GetNodeItemsInputBoundary {
    constructor(
        private readonly db: SessionDBAccessInterface,
        private readonly outputData: GetNodeItemsOutputData,
    ) {}

    async getNodeItems(): Promise<void> {
        const files = this.db.getAllFiles();
        let result: { [key: string]: any } = {};

        for (const file of files){
            const node = file.node;
            const fileName = file.filePath.split("/").at(-1) ?? file.filePath;

            if (!result[node]) result[node] = [];

            result[node].push(fileName);

        }

        this.outputData.setOutputData(result);
    }
}

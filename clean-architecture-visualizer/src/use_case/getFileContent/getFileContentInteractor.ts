import type { GetFileContentInputBoundary } from "./getFileContentInputBoundary.js";
import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { GetFileContentInputData } from "./getFileContentInputData.js";
import type { GetFileContentOutputData } from "./getFileContentOutputData.js";

export class GetFileContentInteractor implements GetFileContentInputBoundary {

    constructor(
            private readonly db: SessionDBAccessInterface,
            private readonly fileAccess: FileAccessInterface,
            private readonly inputData: GetFileContentInputData,
            private readonly outputData: GetFileContentOutputData
        ) {}

    async getFileContent(): Promise<void> {
        const filePath = this.inputData.getFilePath();
        const fileEntry = this.db.getFileByPath(filePath); // ← use full path directly
        console.log(this.inputData.getFilePath())
        if (!fileEntry) {
            return;
        }
        const fileContent = await this.fileAccess.getFileContent(fileEntry.filePath);
        const result = {
            file_path: filePath,
            content: fileContent,
            language: fileEntry.fileType ?? "not_java",
            layer: fileEntry.layer,
            Violation_words: [],
            lines_with_violations: []
        };
        this.outputData.setOutputData(result);
    }
}
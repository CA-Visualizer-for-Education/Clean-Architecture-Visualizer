import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { InitProjectInputBoundary } from "./initProjectInputBoundary.js";
import { InitProjectOutputData } from "./initProjectOutputData.js";
import path from "path";

export class InitProjectInteractor implements InitProjectInputBoundary{
    
    private readonly fileAccess: FileAccessInterface;
    private readonly outputData: InitProjectOutputData;

    constructor(
        fileAccess: FileAccessInterface,
        outputData: InitProjectOutputData = new InitProjectOutputData()
    ) {
        this.fileAccess = fileAccess,
        this.outputData = outputData
    }

    async execute(): Promise<void> {
        try {
            let currPath = await this.fileAccess.getCurrentPath();
            currPath = path.join(currPath, "src")
            
            // 1. Define base paths using path.join for cross-platform support
            const javaPath = path.join(currPath, "main", "java");
            const testPath = path.join(currPath, "test", "java");

            // 2. Define sub-directories within the java path
            const subDirs = [
                "app",
                "use_case",
                "entity",
                "interface_adapter",
                "data_access",
                "view"
            ];

            await this.fileAccess.createDirectory(javaPath);
            await this.fileAccess.createDirectory(testPath);

            for (const dirName of subDirs) {
                const fullPath = path.join(javaPath, dirName);
                await this.fileAccess.createDirectory(fullPath);
            }

            this.outputData.setOutputData(true);
        }
        catch (error) {
            console.error("Initialization failed:", error);
            this.outputData.setOutputData(false);
        }
    }
}
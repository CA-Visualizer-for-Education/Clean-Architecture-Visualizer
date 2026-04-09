import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { InitProjectInputBoundary } from "./initProjectInputBoundary.js";
import type { InitProjectOutputData } from "./initProjectOutputData.js";

export class InitProjectInteractor implements InitProjectInputBoundary{
    
    constructor(
        private readonly fileAccess: FileAccessInterface,
        private readonly outputData: InitProjectOutputData
    ) {}

    async execute(): Promise<void> {
        try {
            const currPath = await this.fileAccess.getCurrentPath();
            
            // Main directories
            const javaPath = currPath + "/main/java";
            const testPath = currPath + "/test/java";

            // Sub-directories
            const app = javaPath + "/app";
            const useCase = javaPath + "/use_case";
            const entity = javaPath + "/entity";
            const interfaceAdapter = javaPath + "/interface_adapter";
            const dataAccess = javaPath + "/data_access";
            const view = javaPath + "/view";

            // Create directories
            await this.fileAccess.createDirectory(javaPath);
            await this.fileAccess.createDirectory(testPath);

            await this.fileAccess.createDirectory(app);
            await this.fileAccess.createDirectory(useCase);
            await this.fileAccess.createDirectory(entity);
            await this.fileAccess.createDirectory(interfaceAdapter);
            await this.fileAccess.createDirectory(dataAccess);
            await this.fileAccess.createDirectory(view);

            this.outputData.setOutputData(true);
        }
        catch (error) {
            this.outputData.setOutputData(false);
        }
    }
}
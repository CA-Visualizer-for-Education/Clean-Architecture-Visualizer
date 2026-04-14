import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { CreateUseCaseInputBoundary } from "./createUseCaseInputBoundary.js";
import type { CreateUseCaseInputData } from "./createUseCaseInputData.js";
import type { CreateUseCaseOutputData } from "./createUseCaseOutputData.js";

export class CreateUseCaseinteractor implements CreateUseCaseInputBoundary {
    
    constructor(
        private readonly fileAccess: FileAccessInterface,
        private readonly inputData: CreateUseCaseInputData,
        private readonly outputData: CreateUseCaseOutputData
    ) {}

    async execute(): Promise<void> {
        try {
            // Get use cases and ensure that we are working with a word with no spaces
            const useCaseName = this.inputData.getUseCaseName().split(" ").join('');

            const currPath = await this.fileAccess.getCurrentPath();

            // Create directories
            const javaPath = currPath + "/main/java"; 
            let useCase = await this.fileAccess.bfsFindDir(javaPath, "use_case");
            let interfaceAdapter = await this.fileAccess.bfsFindDir(javaPath, "interface_adapter");

            if (!useCase || !interfaceAdapter) {
                throw new Error("Could not find use_case or interface_adapter, try intiating project first");
            }

            useCase = useCase + "/" + useCaseName;
            interfaceAdapter = interfaceAdapter + "/" + useCaseName;

            await this.fileAccess.createDirectory(useCase);
            await this.fileAccess.createDirectory(interfaceAdapter);

            const fileTemplate = "/" + useCaseName;

            // create files
            await this.fileAccess.createFile(useCase + fileTemplate + "InputBoundary.java");
            await this.fileAccess.createFile(useCase + fileTemplate + "InputData.java");
            await this.fileAccess.createFile(useCase + fileTemplate + "Interactor.java");
            await this.fileAccess.createFile(useCase + fileTemplate + "OutputData.java");
            await this.fileAccess.createFile(useCase + fileTemplate + "OutputBoundar.java");

            await this.fileAccess.createFile(interfaceAdapter + fileTemplate + "Controller.java");
            await this.fileAccess.createFile(interfaceAdapter + fileTemplate + "Presenter.java");

            this.outputData.setOutputData(true);
        }
        catch (error) {
            this.outputData.setOutputData(false);
        }
    }
}
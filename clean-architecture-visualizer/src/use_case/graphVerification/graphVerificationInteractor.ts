import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { GraphVerificationInputBoundary } from "./graphVerificationInputBoundary.js";

import { useCaseGraph } from "../../entities/useCaseGraph.js";

export class GraphVerificationInteractor implements GraphVerificationInputBoundary{
    private readonly _useCaseList: useCaseGraph[] = [];
    
    // Paths are defined as <File Name, File Path>
    private readonly _entityPaths = new Map<string, string>();
    private readonly _dataAccessPaths = new Map<string, string>();
    private readonly _useCasePaths = new Map<string, string>();
    private readonly _interfaceAdapterPaths = new Map<string, string>();
    private readonly _viewPaths = new Map<string, string>();
    private readonly _databasePaths = new Map<string, string>();

    constructor(
        private readonly fileAccess: FileAccessInterface
    ) {}

    async execute(): Promise<void> {
        const useCases = await this.fileAccess.getUseCases();
        this.fileAccess.getFilePaths("entities", this._entityPaths);
        this.fileAccess.getFilePaths("data_access", this._dataAccessPaths);
        this.fileAccess.getFilePaths("use_case", this._useCasePaths);
        this.fileAccess.getFilePaths("interface_adapters", this._interfaceAdapterPaths);
        this.fileAccess.getFilePaths("views", this._viewPaths);
        this.fileAccess.getFilePaths("database", this._databasePaths);
        useCases.forEach(useCase => {
            this._useCaseList.push(new useCaseGraph(useCase));
        });
    }

    /**
     * Build the outneighbourmaps in each use case using the information from the 
     * paths.
     */
    async developOutNeighbours(): Promise<void> {
        
    }
}

import type { SessionData } from "../types/sessionData.js";
import type { useCaseGraph } from "../entities/useCaseGraph.js";

import type { SessionDBAccessInterface } from "./sessionDBAccessInterface.js";

import { SessionDB } from "../database/sessionDb.js";

export class SessionDBAccess implements SessionDBAccessInterface {
    private readonly db: SessionDB<SessionData>;

    constructor() {
        this.db = new SessionDB<SessionData>;
        this.db.load()
    }

    // Setters
    setProjectName(name: string) {
        this.db.set("projectName", name);
    }

    setNumUseCases(count: number) {
        this.db.set("numUseCases", count);
    }

    setNumViolations(count: number) {
        this.db.set("numViolations", count);
    }

    setUseCases(useCaseList: useCaseGraph[]): void {
        // add all new files to the "database"
        const existingFiles = this.db.get("files") ?? {};

        const newFiles = Object.fromEntries(
            useCaseList.flatMap(useCase => [...useCase.getFiles().entries()])
                .filter(([key]) => !(key in existingFiles))
        );

        this.db.set("files", { ...existingFiles, ...newFiles });

        // add the use case and file pointers to the "database"
        this.db.set("useCases", useCaseList.map((useCase, index) => ({
            id: `uc-${index}`,
            name: useCase.getName(),
            outNeighbours: useCase.getNeighbourMap(),
            fileKeys: [...useCase.getFiles().keys()],
            violationEdges: useCase.getViolationEdges(),
            missingNodes: useCase.getMissingNodes()
        })));
    }

    // Getters
    getProjectName(): string {
        let name = this.db.get("projectName");
        if (!name) return "";
        return name;
    }

    getNumUseCases(): number {
        let count = this.db.get("numUseCases");
        if (!count) return 0;
        return count;
    }

    getNumViolations(): number {
        let count = this.db.get("numViolations");
        if (!count) return 0;
        return count;
    }

    getUseCaseInfo(id: string): SessionData["useCases"][number] | undefined {
    return this.db.get("useCases")?.find(useCase => useCase.id === id);
}
}
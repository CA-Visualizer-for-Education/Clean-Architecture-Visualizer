import type { SessionData } from "../types/sessionData.js";

export interface SessionDBAccessInterface {
    // Setters
    setProjectName(name: string): void;
    setNumUseCases(count: number): void;
    setNumViolations(count: number): void;
    setUseCases(useCaseList: object[]): void;

    // Getters
    getProjectName(): string;
    getNumUseCases(): number;
    getNumViolations(): number;
    getUseCaseInfo(id: string): SessionData["useCases"][number] | undefined;
}
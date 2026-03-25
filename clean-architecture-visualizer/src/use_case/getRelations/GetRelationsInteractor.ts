import type { SessionDBAccessInterface } from "../../data_access/sessionDBAccessInterface.js";
import type { FileAccessInterface } from "../../data_access/fileAccessInterface.js";
import type { cleanLayer } from "../../types/cleanLayer.js";
import type { GetRelationsInputData } from "./GetRelationsInputData.js";
import type { GetRelationsInputBoundary } from "./GetRelationsInputBoundary.js";
import type { GetRelationsOutputData } from "./GetRelationsOutputData.js";

export type FileRelationsResponse = {
    file_path: string;
    relations: RelationEntry[];
};

type RelationEntry = {
    type: RelationType | "";
    file: string;
    line?: number;
    layer: cleanLayer | "";
};

type RelationType = "INSTANTIATION" | "PARAMETER_PASS" | "IMPORT";

export class GetRelationsInteractor implements GetRelationsInputBoundary{

    constructor(
        private readonly db: SessionDBAccessInterface,
        private readonly fileAccess: FileAccessInterface,
        private readonly inputData: GetRelationsInputData,
        private readonly outputData: GetRelationsOutputData
    ) {}

    async execute(): Promise<void> {
        const filePath = this.inputData.getFilePath();

        const allFiles = this.db.getAllFiles();

        // The base name of the target file without extension, used to search for references
        const targetBaseName = filePath.split("/").at(-1)?.replace(/\.[^.]+$/, "") ?? filePath;

        const relations: RelationEntry[] = [];

        for (const file of allFiles) {
            if (file.filePath === filePath) continue;

            const isJava = file.fileType === "java";

            if (!isJava) {
                // Non-java files: include the relation but omit type and line
                const imports = await this.fileAccess.getFileImports(file.filePath);
                const references = imports.some(imp =>
                    imp.toLowerCase().includes(targetBaseName.toLowerCase())
                );

                if (references) {
                    relations.push({
                        type: "",
                        file: file.filePath,
                        layer: file.layer,
                    });
                }
                continue;
            }

            // Java files: scan content to detect relation type and line number
            const content = await this.fileAccess.getFileContent(file.filePath);
            if (!content) continue;

            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line.toLowerCase().includes(targetBaseName.toLowerCase())) continue;

                const relationType = this.detectRelationType(line);
                if (!relationType) continue;

                relations.push({
                    type: relationType,
                    file: file.filePath,
                    line: i + 1,
                    layer: file.layer,
                });

                break;
            }
        }

        this.outputData.setOutputData({ file_path: filePath, relations: relations });
        return;
    }

    /**
     * Detect the relation type from a line of Java source code that references
     * the target file's class name.
     * - INSTANTIATION: the line contains `new ClassName(`
     * - PARAMETER_PASS: the line is a method parameter declaration containing the class name
     * - IMPORT: the line is a plain import statement
     */
    private detectRelationType(line: string): RelationType | null {
        const trimmed = line.trim();

        if (trimmed.startsWith("import ")) return "IMPORT";
        if (/\bnew\s+\w/.test(trimmed)) return "INSTANTIATION";
        if (/\(([^)]*\b\w+\b[^)]*)\)/.test(trimmed) && !trimmed.startsWith("//")) return "PARAMETER_PASS";

        return null;
    }
}
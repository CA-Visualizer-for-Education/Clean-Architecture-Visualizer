export interface FileAccessInterface {
    getUseCases(): Promise<string[]>;
    getFilePaths(node: string, paths: Map<string, string>): Promise<void>;
    getFileImports(path: string): Promise<string[]>;
    getProjectName(): Promise<string>;
    getFileContent(path: string): Promise<string>;
    getFileSnippet(filePath: string, target?: string): Promise<string | undefined>;
    getLineNumber(filePath: string, target: string): Promise<number | undefined>;
}

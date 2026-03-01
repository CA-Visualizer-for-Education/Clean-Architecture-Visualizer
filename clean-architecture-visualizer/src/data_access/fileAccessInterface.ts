export interface FileAccessInterface {
    getUseCases(): Promise<string[]>;
    getFilePaths(node: string, paths: Map<string, string>): Promise<void>;
    getFileImports(path: string): Promise<string[]>;
}

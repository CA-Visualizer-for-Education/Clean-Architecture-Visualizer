export class GetFileContentInputData {
    
    constructor(
        private readonly interactionId: string,
        private readonly filePath: string
    ) {}

    getInteractionId(): string {
        return this.interactionId;
    }

    getFilePath(): string {
        return this.filePath;
    }
}
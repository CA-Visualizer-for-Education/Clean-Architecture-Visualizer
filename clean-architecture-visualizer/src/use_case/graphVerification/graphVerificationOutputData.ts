export class GraphVerificationOutputData {

    private lineContent?: string[];
    private lineColour?: boolean[];

    setOutputData(content: string[], colour: boolean[]) {
        this.lineContent = content;
        this.lineColour = colour;
    }
    
    getLineContent(): string[] {
        if (this.lineContent) return this.lineContent;
        return [];
    }

    getLineColour(): boolean[] {
        if (this.lineColour) return this.lineColour;
        return [];
    }
}
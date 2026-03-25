export class GetFileContentOutputData {

    private fileConentOutputData?: { [key: string]: any }

    setOutputData(outputData: { [key: string]: any }) {
        this.fileConentOutputData = outputData;
    }
    
    getOutputData(): object {
        if (this.fileConentOutputData) return this.fileConentOutputData;
        return {};
    }
}
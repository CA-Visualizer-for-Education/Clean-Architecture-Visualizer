export class GetFileTreeOutputData {

    private fileTreeOutputData?: { [key: string]: any }

    setOutputData(outputData: { [key: string]: any }) {
        this.fileTreeOutputData = outputData;
    }
    
    getOutputData(): object {
        if (this.fileTreeOutputData) return this.fileTreeOutputData;
        return {};
    }
}
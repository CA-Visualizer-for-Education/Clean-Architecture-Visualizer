export class GetFilesWithViolationsOutputData {
    
    private filesWithViolationsOutputData?: { [key: string]: any };

    // called by interactor to store result
    setOutputData(OutputData: {[key: string]: any }) {
        this.filesWithViolationsOutputData = OutputData;
    }

    // called by presenter
    getOutputData(): object {
        if (this.filesWithViolationsOutputData) return this.filesWithViolationsOutputData;
        return {};
    }
}
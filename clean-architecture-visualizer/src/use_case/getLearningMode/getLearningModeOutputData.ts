export class GetLearningModeOutputData {

    private learningOutputData?: { [key: string]: any }

    setOutputData(outputData: { [key: string]: any }) {
        this.learningOutputData = outputData;
    }
    
    getOutputData(): object {
        if (this.learningOutputData) return this.learningOutputData;
        return {};
    }
}
export class GetProjectSummaryOutputData {

    private summaryOutputData?: { [key: string]: any }

    setOutputData(outputData: { [key: string]: any }) {
        this.summaryOutputData = outputData;
    }
    
    getOutputData(): object {
        if (this.summaryOutputData) return this.summaryOutputData;
        return {};
    }
}
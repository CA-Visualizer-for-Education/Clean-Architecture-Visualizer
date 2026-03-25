export class GetUseCaseInfoOutputData {

    private apiOutputData?: { [key: string]: any }

    setOutputData(outputData: { [key: string]: any }) {
        this.apiOutputData = outputData;
    }
    
    getOutputData(): object {
        if (this.apiOutputData) return this.apiOutputData;
        return {};
    }
}
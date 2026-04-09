export class InitProjectOutputData {

    private apiOutputData?: boolean;

    setOutputData(outputData: boolean) {
        this.apiOutputData = outputData;
    }
    
    getOutputData(): boolean {
        if (this.apiOutputData) return this.apiOutputData;
        return false;
    }
}
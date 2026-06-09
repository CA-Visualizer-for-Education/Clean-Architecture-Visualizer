export class GetNodeItemsOutputData{

    private nodeItemsOutputData?: { [key: string]: any }

    setOutputData(outputData: { [key: string]: any }) {
        this.nodeItemsOutputData = outputData;
    }

    getOutputData(): object {
        if (this.nodeItemsOutputData) return this.nodeItemsOutputData;
        return {};
    }


}

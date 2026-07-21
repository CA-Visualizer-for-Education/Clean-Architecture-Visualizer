export class GetNodeItemsInputData {

    constructor(
        private readonly useCase: string
    ) {}

    getUseCase(): string {
        return this.useCase;
    }
}

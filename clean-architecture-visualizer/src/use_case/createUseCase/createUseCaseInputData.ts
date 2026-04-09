export class CreateUseCaseInputData {

    constructor(
        private readonly useCase: string
    ) {}

    getUseCaseName(): string {
        return this.useCase;
    }
}
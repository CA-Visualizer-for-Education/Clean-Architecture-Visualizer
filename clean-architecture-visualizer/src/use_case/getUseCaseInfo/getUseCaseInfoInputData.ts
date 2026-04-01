export class GetUseCaseInfoInputData {
    
    constructor(
        private readonly interactionId: string,
    ) {}

    getInteractionId(): string {
        return this.interactionId;
    }
}
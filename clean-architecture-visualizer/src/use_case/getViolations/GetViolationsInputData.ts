export class GetViolationsInputData {
    
    constructor(
        private readonly interactionId: string
    ) {}

    getInteractionId(): string {
        return this.interactionId;
    }
}
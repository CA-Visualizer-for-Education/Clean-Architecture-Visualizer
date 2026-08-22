export class InitProjectInputData {
  constructor(private readonly language: string) {}

  getLanguage(): string {
    return this.language;
  }
}

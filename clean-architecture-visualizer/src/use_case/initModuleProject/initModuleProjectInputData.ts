export class InitModuleProjectInputData {
  constructor(private readonly language: string) {}

  getLanguage(): string {
    return this.language;
  }
}

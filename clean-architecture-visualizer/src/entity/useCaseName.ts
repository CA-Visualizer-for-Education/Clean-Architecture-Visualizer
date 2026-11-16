/** A feature or use case name that can safely prefix generated class names. */
export class UseCaseName {
  readonly value: string;

  constructor(name: string) {
    const joined = name.split(' ').join('');
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(joined)) {
      throw new Error(
        `"${name}" can't be a class name: use letters and digits, starting with a letter.`
      );
    }
    this.value = joined;
  }
}

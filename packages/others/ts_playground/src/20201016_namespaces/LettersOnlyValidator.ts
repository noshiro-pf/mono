// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="Validation.ts" />
// eslint-disable-next-line @typescript-eslint/no-namespace,@typescript-eslint/no-unused-vars,no-unused-vars
namespace Validation {
  const lettersRegexp = /^[A-Za-z]+$/u;
  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string): boolean {
      return lettersRegexp.test(s);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="Validation.ts" />
// eslint-disable-next-line @typescript-eslint/no-namespace,@typescript-eslint/no-unused-vars,no-unused-vars
namespace Validation {
  const numberRegexp = /^[0-9]+$/;
  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string): boolean {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}

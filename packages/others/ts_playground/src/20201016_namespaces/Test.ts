// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="Validation.ts" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="LettersOnlyValidator.ts" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="ZipCodeValidator.ts" />

// Some samples to try
const strings = ['Hello', '98052', '101'];

// Validators to use
const validators: Record<string, Validation.StringValidator> = {};
validators['ZIP code'] = new Validation.ZipCodeValidator();
validators['Letters only'] = new Validation.LettersOnlyValidator();

// Show whether each string passed each validator
for (const s of strings) {
  // eslint-disable-next-line guard-for-in
  for (const _name in validators) {
    console.log(
      `"${s}" - ${
        validators[_name]?.isAcceptable(s) ?? false
          ? 'matches'
          : 'does not match'
      } ${_name}`,
    );
  }
}

import { type Brand, type ExtendBrand } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Email = Brand<string, 'email'>;
type ValidatedEmail = ExtendBrand<Email, 'validated'>;
// ValidatedEmail has both 'email' and 'validated' as true

type OptionalEmail = ExtendBrand<Email, 'optional', 'required'>;
// Has 'email' and 'optional' as true, 'required' as false

// This would return never (conflicting keys):
// type Invalid = ExtendBrand<Email, 'verified', 'verified'>;

// embed-sample-code-ignore-below
export type { Email, OptionalEmail, ValidatedEmail };

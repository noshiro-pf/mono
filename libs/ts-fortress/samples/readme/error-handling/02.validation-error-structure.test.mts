import { type ValidationErrorDetails } from 'ts-fortress';

// embed-sample-code-ignore-above
type ValidationError = Readonly<{
  path: readonly string[];
  actualValue: unknown; // The actual value that failed validation
  expectedType: string; // The expected type or constraint
  typeName: string; // Name of the type being validated
  details?: ValidationErrorDetails | undefined; // Structured information used to build a descriptive message
}>;

// embed-sample-code-ignore-below
export { type ValidationError };

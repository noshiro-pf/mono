type ValidationError = Readonly<{
  path: readonly string[];
  actualValue: unknown; // The actual value that failed validation
  expectedType: string; // The expected type or constraint
  message: string | undefined; // Optional custom error message
  typeName: string; // Name of the type being validated
}>;

// embed-sample-code-ignore-below
export { type ValidationError };

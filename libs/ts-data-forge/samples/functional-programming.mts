import { match, Optional, pipe, Result } from 'ts-data-forge';

// Optional for nullable values
const maybeValue = Optional.some(42);

const doubled = Optional.map(maybeValue, (x) => x * 2);

if (import.meta.vitest !== undefined) {
  expect(Optional.unwrapOr(doubled, 0)).toBe(84);
}

// Result for error handling
const success = Result.ok(42);

const mapped = Result.map(success, (x) => x * 2);

if (import.meta.vitest !== undefined) {
  expect(mapped).toStrictEqual(Result.ok(84));
}

// Advanced pipe usage
const processNumber = (input: number): Optional<number> => {
  const result = pipe(input)
    .map((x) => x * 2) // Regular transformation
    .map((x) => x + 10).value; // Chain transformations // Get the result

  // Convert to Optional and continue processing
  return result > 50 ? Optional.some(result / 2) : Optional.none;
};

if (import.meta.vitest !== undefined) {
  expect(processNumber(30)).toStrictEqual(Optional.some(35));

  expect(processNumber(10)).toStrictEqual(Optional.none);
}

// Pattern matching with match
type Status = 'loading' | 'success' | 'error';

const handleStatus = (status: Status, data?: string): string =>
  match(status, {
    loading: 'Please wait...',
    success: `Data: ${data ?? 'No data'}`,
    error: 'An error occurred',
  });

if (import.meta.vitest !== undefined) {
  expect(handleStatus('loading')).toBe('Please wait...');
  expect(handleStatus('success', 'Hello')).toBe('Data: Hello');
  expect(handleStatus('error')).toBe('An error occurred');
}

// Pattern matching with Result
const processResult = (result: Result<number, string>): string =>
  Result.isOk(result) ? `Success: ${result.value}` : `Error: ${result.value}`;

if (import.meta.vitest !== undefined) {
  expect(processResult(Result.ok(42))).toBe('Success: 42');
  expect(processResult(Result.err('Failed'))).toBe('Error: Failed');
}

import { unknownToString } from './unknown-to-string.mjs';

describe('unknownToString', () => {
  test('string', () => {
    const result = unknownToString('aaaaa');
    expect(result).toBe('aaaaa');
    expect(JSON.stringify('aaaaa')).toBe('"aaaaa"');
  });

  test('number', () => {
    const result = unknownToString(1);
    expect(result).toBe('1');
    expect(JSON.stringify(1)).toBe('1');
  });

  test('boolean', () => {
    const result = unknownToString(true);
    expect(result).toBe('true');
    expect(JSON.stringify(true)).toBe('true');
  });

  test('symbol', () => {
    const result = unknownToString(Symbol('sym'));
    expect(result).toBe('Symbol(sym)');
    expect(JSON.stringify(Symbol('sym'))).toBeUndefined();
  });

  test('function', () => {
    const result = unknownToString(() => 0);
    expect(result).toBe('() => 0');
    expect(JSON.stringify(() => 0)).toBeUndefined();
  });

  test('undefined', () => {
    const result = unknownToString(undefined);
    expect(result).toBe('undefined');
    expect(JSON.stringify(undefined)).toBeUndefined();
  });

  test('null', () => {
    const result = unknownToString(null);
    expect(result).toBe('null');
    expect(JSON.stringify(null)).toBe('null');
  });

  test('object', () => {
    const result = unknownToString({ a: { b: 1 } });
    expect(result).toBe('{"a":{"b":1}}');
    expect(JSON.stringify({ a: { b: 1 } })).toBe('{"a":{"b":1}}');
  });

  test('object(prettyPrint=true)', () => {
    const result = unknownToString(
      { a: { b: 1 } },
      { prettyPrintObject: true },
    );
    expect(result).toBe(
      [
        //
        `{`,
        `  "a": {`,
        `    "b": 1`,
        `  }`,
        `}`,
      ].join('\n'),
    );
  });

  test('circular reference returns error message', () => {
    const mut_circular: { a: number; self?: unknown } = { a: 1 };
    mut_circular.self = mut_circular;
    const result = unknownToString(mut_circular);
    // Should return an error message string instead of throwing
    expect(typeof result).toBe('string');
    expect(result).toMatch(/circular|serialize/iu);
  });

  test('BigInt value', () => {
    const result = unknownToString(123n);
    expect(result).toBe('123n');
  });

  test('non-Error thrown during serialization returns fallback text', () => {
    const value = {
      toJSON: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'custom failure';
      },
    };

    const result = unknownToString(value);
    expect(result).toBe('[Circular or Non-serializable]');
  });
});

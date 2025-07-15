import { Result } from '../functional/index.mjs';
import { unknownToString } from './unknown-to-string.mjs';

describe('unknownToString', () => {
  test('string', () => {
    const result = unknownToString('aaaaa');
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('aaaaa');
    }
    expect(JSON.stringify('aaaaa')).toBe('"aaaaa"');
  });

  test('number', () => {
    const result = unknownToString(1);
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('1');
    }
    expect(JSON.stringify(1)).toBe('1');
  });

  test('boolean', () => {
    const result = unknownToString(true);
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('true');
    }
    expect(JSON.stringify(true)).toBe('true');
  });

  test('symbol', () => {
    const result = unknownToString(Symbol('sym'));
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('Symbol(sym)');
    }
    expect(JSON.stringify(Symbol('sym'))).toBeUndefined();
  });

  test('function', () => {
    const result = unknownToString(() => 0);
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('() => 0');
    }
    expect(JSON.stringify(() => 0)).toBeUndefined();
  });

  test('undefined', () => {
    const result = unknownToString(undefined);
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('undefined');
    }
    expect(JSON.stringify(undefined)).toBeUndefined();
  });

  test('null', () => {
    const result = unknownToString(null);
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('null');
    }
    expect(JSON.stringify(null)).toBe('null');
  });

  test('object', () => {
    const result = unknownToString({ a: { b: 1 } });
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('{"a":{"b":1}}');
    }
    expect(JSON.stringify({ a: { b: 1 } })).toBe('{"a":{"b":1}}');
  });

  test('object(prettyPrint=true)', () => {
    const result = unknownToString(
      { a: { b: 1 } },
      { prettyPrintObject: true },
    );
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe(
        [
          //
          `{`,
          `  "a": {`,
          `    "b": 1`,
          `  }`,
          `}`,
        ].join('\n'),
      );
    }
  });

  test('circular reference returns error', () => {
    const mut_circular: { a: number; self?: unknown } = { a: 1 };
    mut_circular.self = mut_circular;
    const result = unknownToString(mut_circular);
    expect(Result.isErr(result)).toBe(true);
    if (Result.isErr(result)) {
      expect(result.value.message).toContain('circular');
    }
  });

  test('BigInt value', () => {
    const result = unknownToString(BigInt(123));
    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('123');
    }
  });
});

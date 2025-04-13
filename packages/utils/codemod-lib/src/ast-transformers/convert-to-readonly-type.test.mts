import { describe, expect, it } from 'vitest';
import { convertToReadonlyType } from './convert-to-readonly-type';

describe('convertToReadonlyType', () => {
  // Basic types
  it('should not change primitive types', () => {
    expect(convertToReadonlyType('number')).toBe('number');
    expect(convertToReadonlyType('string')).toBe('string');
    expect(convertToReadonlyType('boolean')).toBe('boolean');
    expect(convertToReadonlyType('null')).toBe('null');
    expect(convertToReadonlyType('undefined')).toBe('undefined');
    expect(convertToReadonlyType('any')).toBe('any');
    expect(convertToReadonlyType('unknown')).toBe('unknown');
    expect(convertToReadonlyType('never')).toBe('never');
  });

  // Array types
  it('should convert array types to readonly array types', () => {
    expect(convertToReadonlyType('string[]')).toBe('readonly string[]');
    expect(convertToReadonlyType('Array<number>')).toBe('readonly number[]');
    expect(convertToReadonlyType('readonly string[]')).toBe('readonly string[]');
    expect(convertToReadonlyType('ReadonlyArray<number>')).toBe('readonly number[]');
  });

  // Nested array types
  it('should handle nested array types', () => {
    expect(convertToReadonlyType('string[][]')).toBe('readonly (readonly string[])[]');
    expect(convertToReadonlyType('Array<Array<number>>')).toBe('readonly (readonly number[])[]');
    expect(convertToReadonlyType('readonly string[][]')).toBe('readonly (readonly string[])[]');
    expect(convertToReadonlyType('ReadonlyArray<Array<number>>')).toBe('readonly (readonly number[])[]');
  });

  // Object types
  it('should convert object types to readonly object types', () => {
    expect(convertToReadonlyType('{ a: string; b: number }')).toBe('{ readonly a: string; readonly b: number }');
    expect(convertToReadonlyType('{ readonly a: string; b: number }')).toBe('{ readonly a: string; readonly b: number }');
  });

  // Nested object types
  it('should handle nested object types', () => {
    expect(convertToReadonlyType('{ a: { b: string } }')).toBe('{ readonly a: { readonly b: string } }');
    expect(convertToReadonlyType('{ readonly a: { b: string } }')).toBe('{ readonly a: { readonly b: string } }');
  });

  // Tuple types
  it('should convert tuple types to readonly tuple types', () => {
    expect(convertToReadonlyType('[string, number]')).toBe('readonly [string, number]');
    expect(convertToReadonlyType('readonly [string, number]')).toBe('readonly [string, number]');
  });

  // Union types
  it('should handle union types', () => {
    expect(convertToReadonlyType('string | number[]')).toBe('string | readonly number[]');
    expect(convertToReadonlyType('string | readonly number[]')).toBe('string | readonly number[]');
  });

  // Intersection types
  it('should handle intersection types', () => {
    expect(convertToReadonlyType('{ a: string } & { b: number[] }')).toBe('{ readonly a: string } & { readonly b: readonly number[] }');
  });

  // Generic types
  it('should handle generic types', () => {
    expect(convertToReadonlyType('Map<string, number[]>')).toBe('ReadonlyMap<string, readonly number[]>');
    expect(convertToReadonlyType('Set<string[]>')).toBe('ReadonlySet<readonly string[]>');
  });

  // Readonly utility type
  it('should normalize Readonly utility type', () => {
    expect(convertToReadonlyType('Readonly<{ a: string }>')).toBe('{ readonly a: string }');
    expect(convertToReadonlyType('Readonly<string[]>')).toBe('readonly string[]');
    expect(convertToReadonlyType('Readonly<readonly string[]>')).toBe('readonly string[]');
    expect(convertToReadonlyType('Readonly<Readonly<string[]>>')).toBe('readonly string[]');
  });

  // DeepReadonly type tests
  it('should handle DeepReadonly type for primitive types', () => {
    expect(convertToReadonlyType('DeepReadonly<number>')).toBe('number');
    expect(convertToReadonlyType('DeepReadonly<string>')).toBe('string');
    expect(convertToReadonlyType('DeepReadonly<boolean>')).toBe('boolean');
  });

  it('should handle DeepReadonly type for array types', () => {
    expect(convertToReadonlyType('DeepReadonly<number[]>')).toBe('readonly (readonly number[])');
    expect(convertToReadonlyType('DeepReadonly<Array<string>>')).toBe('readonly (readonly string[])');
    expect(convertToReadonlyType('DeepReadonly<string[][]>')).toBe('readonly (readonly (readonly string[])[])');
  });

  it('should handle DeepReadonly type for object types', () => {
    expect(convertToReadonlyType('DeepReadonly<{ a: string; b: number }>')).toBe('{ readonly a: string; readonly b: number }');
    expect(convertToReadonlyType('DeepReadonly<{ a: { b: string } }>')).toBe('{ readonly a: { readonly b: string } }');
    expect(convertToReadonlyType('DeepReadonly<{ a: string[]; b: { c: number } }>')).toBe('{ readonly a: readonly string[]; readonly b: { readonly c: number } }');
  });

  it('should handle DeepReadonly type for Map and Set', () => {
    expect(convertToReadonlyType('DeepReadonly<Map<string, number>>')).toBe('ReadonlyMap<string, number>');
    expect(convertToReadonlyType('DeepReadonly<Map<string, number[]>>')).toBe('ReadonlyMap<string, readonly number[]>');
    expect(convertToReadonlyType('DeepReadonly<Set<string>>')).toBe('ReadonlySet<string>');
    expect(convertToReadonlyType('DeepReadonly<Set<{ a: number }>>')).toBe('ReadonlySet<{ readonly a: number }>');
  });

  it('should handle DeepReadonly type for complex nested types', () => {
    expect(convertToReadonlyType('DeepReadonly<{ a: Map<string, { b: number[] }> }>')).toBe('{ readonly a: ReadonlyMap<string, { readonly b: readonly number[] }> }');
    expect(convertToReadonlyType('DeepReadonly<{ data: Array<{ id: string; items: Array<{ name: string }> }> }>')).toBe('{ readonly data: readonly (readonly { readonly id: string; readonly items: readonly (readonly { readonly name: string })[]; })[]; }');
  });

  it('should normalize nested DeepReadonly types', () => {
    expect(convertToReadonlyType('DeepReadonly<DeepReadonly<number[]>>')).toBe('readonly number[]');
    expect(convertToReadonlyType('DeepReadonly<Readonly<{ a: string }>>')).toBe('{ readonly a: string }');
    expect(convertToReadonlyType('Readonly<DeepReadonly<{ a: string[] }>>')).toBe('{ readonly a: readonly string[] }');
  });

  it('should handle DeepReadonly with union and intersection types', () => {
    expect(convertToReadonlyType('DeepReadonly<string | number[]>')).toBe('string | readonly number[]');
    expect(convertToReadonlyType('DeepReadonly<{ a: string } & { b: number[] }>')).toBe('{ readonly a: string } & { readonly b: readonly number[] }');
  });
});

import {
  ReadonlyBitArray,
  ReadonlyBitArrayFromStr,
} from './readonly-bit-array';

test('size', () => {
  expect(ReadonlyBitArray([0, 0, 0]).size).toBe(3);
});

test('size', () => {
  expect(ReadonlyBitArray([]).size).toBe(0);
});

test('get', () => {
  expect(ReadonlyBitArray([]).get(0)).toBe(undefined);
});

test('get', () => {
  expect(ReadonlyBitArray([0, 0, 1]).get(2)).toBe(1);
});

test('get', () => {
  expect(ReadonlyBitArray([0, 0, 1]).get(3)).toBe(undefined);
});

test('get', () => {
  expect(ReadonlyBitArray([0, 0, 1]).get(-1)).toBe(undefined);
});

test('get', () => {
  expect(ReadonlyBitArray([0, 0, 1]).get(-1) ?? 0).toBe(0);
});

test('get', () => {
  expect(ReadonlyBitArray([0, 0, 1]).get(-1) ?? 1).toBe(1);
});

test('get', () => {
  expect(ReadonlyBitArray([0, 0, 1]).get(2)).toBe(1);
});

test('get', () => {
  expect(ReadonlyBitArray(new Uint8Array([0, 0, 2])).get(2)).toBe(1);
});

test('values', () => {
  const rb = ReadonlyBitArray(new Uint8Array([0, 0, 0]));
  for (const v of rb.values()) {
    expect(v).toBe(0);
  }
});

test('values', () => {
  const rb = ReadonlyBitArray(new Uint8Array([2, 3, 4]));
  for (const v of rb.values()) {
    expect(v).toBe(1);
  }
});

test('entries', () => {
  const rb = ReadonlyBitArray(new Uint8Array([2, 3, 4]));
  for (const [i, v] of rb.entries()) {
    expect(i === 0 || i === 1 || i === 2).toBe(true);
    expect(v).toBe(1);
  }
});

test('map', () => {
  const rb = ReadonlyBitArray([0, 0, 1]).map((v) => (v === 1 ? 0 : 1));
  expect(rb.size).toBe(3);
  expect(rb.get(0)).toBe(1);
  expect(rb.get(1)).toBe(1);
  expect(rb.get(2)).toBe(0);
});

test('map', () => {
  const rb = ReadonlyBitArray([0, 0, 1, 1, 0]);
  expect(rb.toString()).toBe('00110');
});

test('fromstr', () => {
  const rb = ReadonlyBitArrayFromStr('12010');
  expect(rb.size).toBe(5);
  expect(rb.get(0)).toBe(1);
  expect(rb.get(1)).toBe(1);
  expect(rb.get(2)).toBe(0);
  expect(rb.get(3)).toBe(1);
  expect(rb.get(4)).toBe(0);
});

test('fromstr', () => {
  const rb = ReadonlyBitArrayFromStr('');
  expect(rb.size).toBe(0);
  expect(rb.get(0)).toBe(undefined);
});

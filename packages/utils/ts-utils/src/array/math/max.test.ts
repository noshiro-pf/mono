import { max } from './max';

test('max', () => expect(max([1, 2, 3])).toBe(3));
test('max', () => expect(max([1, 3, 2])).toBe(3));
test('max', () => expect(max([2, 3, 1])).toBe(3));
test('max', () => expect(max([3, 2, 1])).toBe(3));
test('max', () => expect(max([3, 2, 1])).toBe(3));
test('max', () => expect(max([3])).toBe(3));
test('max', () => expect(max([])).toBe(undefined));

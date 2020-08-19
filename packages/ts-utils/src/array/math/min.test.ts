import { min } from './min';

test('min', () => expect(min([1, 2, 3])).toBe(1));
test('min', () => expect(min([1, 3, 2])).toBe(1));
test('min', () => expect(min([2, 3, 1])).toBe(1));
test('min', () => expect(min([3, 2, 1])).toBe(1));
test('min', () => expect(min([3, 2, 1])).toBe(1));
test('min', () => expect(min([1])).toBe(1));
test('min', () => expect(min([])).toBe(undefined));
const xs = [1, 2, 3] as const;
test('min', () => expect(min(xs)).toBe(1));

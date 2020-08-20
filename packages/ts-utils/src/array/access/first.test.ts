import { first } from './first';

test('first', () => expect(first([1, 2, 3, 4, 5])).toEqual(1));
test('first', () => expect(first([])).toEqual(undefined));
test('first', () => expect(first([]) ?? 0).toEqual(0));
test('first', () => expect(first([1, 2, 3])).toEqual(1));

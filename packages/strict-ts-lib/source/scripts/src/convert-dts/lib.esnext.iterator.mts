import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEsNextIterator = ({
  brandedNumber,
}: ConverterOptions): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    // Array
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'declare global {',
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        replaceWithNoMatchCheck(
          `map<U>(callbackfn: (value: T, index: number) => U): IteratorObject<U, undefined, unknown>;`,
          `map<U>(callbackfn: (value: T, index: ${brandedNumber.ArraySizeArgNonNegative}) => U): IteratorObject<U, undefined, unknown>;`,
        ),
        replaceWithNoMatchCheck(
          `filter<S extends T>(predicate: (value: T, index: number) => value is S): IteratorObject<S, undefined, unknown>;`,
          `filter<S extends T>(predicate: (value: T, index: ${brandedNumber.ArraySizeArgNonNegative}) => value is S): IteratorObject<S, undefined, unknown>;`,
        ),
        replaceWithNoMatchCheck(
          `filter(predicate: (value: T, index: number) => unknown): IteratorObject<T, undefined, unknown>;`,
          `filter(predicate: (value: T, index: ${brandedNumber.ArraySizeArgNonNegative}) => unknown): IteratorObject<T, undefined, unknown>;`,
        ),
        replaceWithNoMatchCheck(
          `take(limit: number): IteratorObject<T, undefined, unknown>;`,
          `take(limit: ${brandedNumber.ArraySizeArgNonNegative}): IteratorObject<T, undefined, unknown>;`,
        ),
        replaceWithNoMatchCheck(
          `drop(count: number): IteratorObject<T, undefined, unknown>;`,
          `drop(limit: ${brandedNumber.ArraySizeArgNonNegative}): IteratorObject<T, undefined, unknown>;`,
        ),
        replaceWithNoMatchCheck(
          `flatMap<U>(callback: (value: T, index: number) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined>): IteratorObject<U, undefined, unknown>;`,
          `flatMap<U>(callback: (value: T, index: ${brandedNumber.ArraySizeArgNonNegative}) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined>): IteratorObject<U, undefined, unknown>;`,
        ),
        replaceWithNoMatchCheck(
          `reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T`,
          `reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: ${brandedNumber.ArraySizeArgNonNegative}) => T`,
        ),
        replaceWithNoMatchCheck(
          `reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;`,
          `reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: ${brandedNumber.ArraySizeArgNonNegative}) => U, initialValue: U): U;`,
        ),
        replaceWithNoMatchCheck(
          `forEach(callbackfn: (value: T, index: number) => void): void;`,
          `forEach(callbackfn: (value: T, index: ${brandedNumber.ArraySizeArgNonNegative}) => void): void;`,
        ),
        replaceWithNoMatchCheck(
          `some(predicate: (value: T, index: number) => unknown): boolean;`,
          `some(predicate: (value: T, index: ${brandedNumber.ArraySizeArgNonNegative}) => unknown): boolean;`,
        ),
        replaceWithNoMatchCheck(
          `every(predicate: (value: T, index: number) => unknown): boolean;`,
          `every(predicate: (value: T, index: ${brandedNumber.ArraySizeArgNonNegative}) => unknown): boolean;`,
        ),
        replaceWithNoMatchCheck(
          `find<S extends T>(predicate: (value: T, index: number) => value is S): S | undefined;`,
          `find<S extends T>(predicate: (value: T, index: ${brandedNumber.ArraySizeArgNonNegative}) => value is S): S | undefined;`,
        ),
        replaceWithNoMatchCheck(
          `find(predicate: (value: T, index: number) => unknown): T | undefined;`,
          `find(predicate: (value: T, index: ${brandedNumber.ArraySizeArgNonNegative}) => unknown): T | undefined;`,
        ),
      ),
    }),
  );
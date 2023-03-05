import { type DeepPartial } from '../src';
import { expectType } from './expect-type';

expectType<
  DeepPartial<{ a: { b: { c: number[]; 1: 2 } } }>,
  {
    a?: {
      b?: {
        c?: (number | undefined)[];
        1?: 2;
      };
    };
  }
>('=');

expectType<
  DeepPartial<{ a: { b: { c: [1, 2, 5] } } }>,
  {
    a?: {
      b?: {
        c?: [(1 | undefined)?, (2 | undefined)?, (5 | undefined)?] | undefined;
      };
    };
  }
>('=');

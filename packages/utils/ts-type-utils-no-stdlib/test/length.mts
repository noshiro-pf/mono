import { expectType } from './expect-type.mjs';

expectType<Length<readonly [1, 2, 3]>, 3>('=');

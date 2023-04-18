import { type Length } from '../src';
import { expectType } from './expect-type';

expectType<Length<readonly [1, 2, 3]>, 3>('=');

import { expectType } from 'ts-data-forge';
import { type IsNever } from './is-never.mjs';

expectType<IsNever<never>, true>('=');

expectType<IsNever<string>, false>('=');

expectType<IsNever<number | string>, false>('=');

expectType<IsNever<[number | string]>, false>('=');

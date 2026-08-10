import { expectType } from 'ts-data-forge';
import { type IsAny, type IsNotAny } from './is-any.mjs';

// ── IsAny ─────────────────────────
expectType<IsAny<any>, true>('=');

expectType<IsAny<unknown>, false>('=');

expectType<IsAny<never>, false>('=');

expectType<IsAny<string>, false>('=');

expectType<IsAny<0>, false>('=');

expectType<IsAny<null>, false>('=');

expectType<IsAny<undefined>, false>('=');

expectType<IsAny<{}>, false>('=');

expectType<IsAny<string | number>, false>('=');

// `any` in a union absorbs the union, so the whole type is `any`.
expectType<IsAny<string | any>, true>('=');

// ── IsNotAny ─────────────────────────
expectType<IsNotAny<any>, false>('=');

expectType<IsNotAny<unknown>, true>('=');

expectType<IsNotAny<never>, true>('=');

expectType<IsNotAny<string>, true>('=');

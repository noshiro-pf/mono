import { expectType } from 'ts-data-forge';
import { type IsNotUnknown, type IsUnknown } from './is-unknown.mjs';

// ── IsUnknown ─────────────────────────
expectType<IsUnknown<unknown>, true>('=');

expectType<IsUnknown<any>, false>('=');

expectType<IsUnknown<never>, false>('=');

expectType<IsUnknown<string>, false>('=');

expectType<IsUnknown<0>, false>('=');

expectType<IsUnknown<null>, false>('=');

expectType<IsUnknown<undefined>, false>('=');

expectType<IsUnknown<{}>, false>('=');

expectType<IsUnknown<string | number>, false>('=');

// `unknown` in a union absorbs the union, so the whole type is `unknown`.
expectType<IsUnknown<string | unknown>, true>('=');

// ── IsNotUnknown ─────────────────────────
expectType<IsNotUnknown<unknown>, false>('=');

expectType<IsNotUnknown<any>, true>('=');

expectType<IsNotUnknown<never>, true>('=');

expectType<IsNotUnknown<string>, true>('=');

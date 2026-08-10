/**
 * @internal Distinguish types to avoid conflicts with branded types created
 * outside of `ts-type-utils`.
 *
 * MEMO: [gcanti/io-ts](https://github.com/gcanti/io-ts) uses unique symbol,
 * but ts-type-utils doesn't use it to maintain independence as a type
 * library.
 *
 * The `TSTypeForgeInternals_` prefix marks this as a non-public surface
 * that consumers should not rely on.
 */
export type TSTypeForgeInternals_BrandEncapsulated<B> = B &
  Readonly<{
    'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
  }>;

import { expectType } from './expect-type.mjs';

{
  console.log('a');
}

{
  const log = (...args: readonly unknown[]): string => args.join('');

  const r = log('1', 2, 3);

  expectType<typeof r, string>('=');
}

{
  const log = (...args: readonly never[]): string => args.join('');

  // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'never'.
  const r = log('1', 2, 3);

  expectType<typeof r, string>('=');
}

{
  const log = (args: readonly unknown[]): string => args.join('');

  const r = log(['1', 2, 3]);

  expectType<typeof r, string>('=');
}

{
  const log = (args: readonly never[]): string => args.join('');

  // @ts-expect-error Type 'string' is not assignable to type 'never'.
  const r = log(['1', 2, 3]);

  expectType<typeof r, string>('=');
}

{
  const log = <A extends readonly unknown[]>(...args: A): string =>
    args.join('');

  const r = log('1', 2, 3);

  expectType<typeof r, string>('=');
}

{
  const log = <A extends readonly never[]>(...args: A): string => args.join('');

  // @ts-expect-error Type 'string' is not assignable to type 'never'.
  const r = log('1', 2, 3);

  expectType<typeof r, string>('=');
}

{
  type Parameters2<T extends (...args: readonly never[]) => unknown> =
    T extends (...args: infer P) => unknown ? P : never;

  expectType<
    Parameters2<(x: number, y: string) => string>,
    [x: number, y: string]
  >('=');
}

{
  type Parameters2<T extends (...args: readonly unknown[]) => unknown> =
    T extends (...args: infer P) => unknown ? P : never;

  expectType<
    // @ts-expect-error Type 'unknown' is not assignable to type 'number'.
    Parameters2<(x: number, y: string) => string>,
    [x: number, y: string]
  >('=');
}

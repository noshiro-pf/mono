// cspell-ignore-file

import * as React from 'react';
import { noop } from './noop.mjs';

type Props = Readonly<{
  numList: readonly number[];
}>;

// OK
export const Ok = React.memo<Props>((props) => {
  const sum = React.useMemo(
    () => props.numList.reduce((a, b) => a + b, 0),
    [props.numList],
  );

  return <div>{sum}</div>;
});

Ok.displayName = 'Ok';

// OK
export const NoReturnStatementWithSpread = React.memo<Props>(({ numList }) => (
  <div>{numList.length}</div>
));

NoReturnStatementWithSpread.displayName = 'NoReturnStatementWithSpread';

// OK
export const NoReturnStatementWithoutSpread = React.memo<Props>((props) => (
  <div>{props.numList.length}</div>
));

NoReturnStatementWithoutSpread.displayName = 'NoReturnStatementWithoutSpread';

// NG
// eslint-disable-next-line no-restricted-syntax
export const ArgAnnotated = React.memo<Props>((props: Props) => {
  const sum = React.useMemo(
    () => props.numList.reduce((a, b) => a + b, 0),
    [props.numList],
  );

  return <div>{sum}</div>;
});

ArgAnnotated.displayName = 'ArgAnnotated';

// NG
export const ArgAnnotatedAsInline = React.memo<Props>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types, react/prefer-read-only-props,no-restricted-syntax
  (props: { numList: readonly number[] }) => {
    const sum = React.useMemo(
      () => props.numList.reduce((a, b) => a + b, 0),
      [props.numList],
    );

    return <div>{sum}</div>;
  },
);

ArgAnnotatedAsInline.displayName = 'ArgAnnotatedAsInline';

// NG
export const ArgAnnotatedAsInlineWithTypeReference = React.memo<Props>(
  // eslint-disable-next-line no-restricted-syntax
  (props: Readonly<{ numList: readonly number[] }>) => {
    const sum = React.useMemo(
      () => props.numList.reduce((a, b) => a + b, 0),
      [props.numList],
    );

    return <div>{sum}</div>;
  },
);

ArgAnnotatedAsInlineWithTypeReference.displayName =
  'ArgAnnotatedAsInlineWithTypeReference';

// NG
export const MemoWithoutTypeArgument: React.MemoExoticComponent<
  (props: Props) => React.JSX.Element
> =
  // eslint-disable-next-line no-restricted-syntax
  React.memo((props) => {
    const sum = React.useMemo(
      () => props.numList.reduce((a, b) => a + b, 0),
      [props.numList],
    );

    return <div>{sum}</div>;
  });

MemoWithoutTypeArgument.displayName = 'MemoWithoutTypeArgument';

// NG
// @ts-expect-error Parameter 'props' implicitly has an 'any' type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any,no-restricted-syntax
export const MemoAnnotatedAsAny = React.memo<any>((props) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const sum = React.useMemo(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    () => props.numList.reduce((a: number, b: number) => a + b, 0),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [props.numList],
  );

  return <div>{sum}</div>;
});

MemoAnnotatedAsAny.displayName = 'MemoAnnotatedAsAny';

// NG
// eslint-disable-next-line no-restricted-syntax
export const MemoAnnotatedAsInline = React.memo<{ numList: readonly number[] }>(
  (props) => {
    const sum = React.useMemo(
      () => props.numList.reduce((a, b) => a + b, 0),
      [props.numList],
    );

    return <div>{sum}</div>;
  },
);

MemoAnnotatedAsInline.displayName = 'MemoAnnotatedAsInline';

// NG
// eslint-disable-next-line no-restricted-syntax
export const MemoAnnotatedAsInlineWithTypeReference = React.memo<
  Readonly<{ numList: readonly number[] }>
>((props) => {
  const sum = React.useMemo(
    () => props.numList.reduce((a, b) => a + b, 0),
    [props.numList],
  );

  return <div>{sum}</div>;
});

MemoAnnotatedAsInlineWithTypeReference.displayName =
  'MemoAnnotatedAsInlineWithTypeReference';

// NG
// eslint-disable-next-line no-restricted-syntax
export const ArgSpread = React.memo<Props>(({ numList }) => {
  const sum = React.useMemo(
    () => numList.reduce((a, b) => a + b, 0),
    [numList],
  );

  return <div>{sum}</div>;
});

ArgSpread.displayName = 'ArgSpread';

// NG
// eslint-disable-next-line no-restricted-syntax
const TooooooooooooooooooooooooLongComponentName = React.memo<Props>(
  (props) => {
    const sum = React.useMemo(
      () => props.numList.reduce((a, b) => a + b, 0),
      [props.numList],
    );

    return <div>{sum}</div>;
  },
);

TooooooooooooooooooooooooLongComponentName.displayName =
  'TooooooooooooooooooooooooLongComponentName';

noop(TooooooooooooooooooooooooLongComponentName);

// cspell-ignore-file
/* transformer-ignore convert-to-readonly  */

import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { noop } from './noop.mjs';

type Props = Readonly<{
  numList: readonly number[];
}>;

// OK
export const Ok = React.memo<Props>((props) => {
  const sum = React.useMemo(() => Arr.sum(props.numList), [props.numList]);

  return <div>{sum}</div>;
});

Ok.displayName = 'Ok';

// OK
export const NoReturnStatementWithDestructedProps = React.memo<Props>(
  ({ numList }) => <div>{numList.length}</div>,
);

NoReturnStatementWithDestructedProps.displayName =
  'NoReturnStatementWithDestructedProps';

// OK
export const NoReturnStatementWithoutDestructedProps = React.memo<Props>(
  (props) => <div>{props.numList.length}</div>,
);

NoReturnStatementWithoutDestructedProps.displayName =
  'NoReturnStatementWithoutDestructedProps';

// OK
export const MemoWithoutProps = React.memo(() => <div>{1}</div>);

MemoWithoutProps.displayName = 'MemoWithoutProps';

// NG
// eslint-disable-next-line react-coding-style/react-memo-type-parameter
export const MemoWithoutPropsWithUnnecessaryTypeArg = React.memo<never>(() => (
  <div>{1}</div>
));

MemoWithoutPropsWithUnnecessaryTypeArg.displayName =
  'MemoWithoutPropsWithUnnecessaryTypeArg';

// NG
// eslint-disable-next-line react-coding-style/props-type-annotation-style
export const ArgAnnotated = React.memo<Props>((props: Props) => {
  const sum = React.useMemo(() => Arr.sum(props.numList), [props.numList]);

  return <div>{sum}</div>;
});

ArgAnnotated.displayName = 'ArgAnnotated';

// NG
export const ArgAnnotatedAsInline = React.memo<Props>(
  // eslint-disable-next-line react-coding-style/props-type-annotation-style, @typescript-eslint/prefer-readonly-parameter-types, react/prefer-read-only-props
  (props: { numList: readonly number[] }) => {
    const sum = React.useMemo(() => Arr.sum(props.numList), [props.numList]);

    return <div>{sum}</div>;
  },
);

ArgAnnotatedAsInline.displayName = 'ArgAnnotatedAsInline';

// NG
export const ArgAnnotatedAsInlineWithTypeReference = React.memo<Props>(
  // eslint-disable-next-line react-coding-style/props-type-annotation-style
  (props: Readonly<{ numList: readonly number[] }>) => {
    const sum = React.useMemo(() => Arr.sum(props.numList), [props.numList]);

    return <div>{sum}</div>;
  },
);

ArgAnnotatedAsInlineWithTypeReference.displayName =
  'ArgAnnotatedAsInlineWithTypeReference';

// NG
export const MemoWithoutTypeArgument: React.MemoExoticComponent<
  (props: Props) => React.JSX.Element
> =
  // eslint-disable-next-line react-coding-style/react-memo-type-parameter
  React.memo((props) => {
    const sum = React.useMemo(() => Arr.sum(props.numList), [props.numList]);

    return <div>{sum}</div>;
  });

MemoWithoutTypeArgument.displayName = 'MemoWithoutTypeArgument';

// NG
// @ts-expect-error Parameter 'props' implicitly has an 'any' type.
// eslint-disable-next-line react-coding-style/react-memo-type-parameter, @typescript-eslint/no-explicit-any
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
// eslint-disable-next-line react-coding-style/react-memo-type-parameter
export const MemoAnnotatedAsInline = React.memo<{ numList: readonly number[] }>(
  (props) => {
    const sum = React.useMemo(() => Arr.sum(props.numList), [props.numList]);

    return <div>{sum}</div>;
  },
);

MemoAnnotatedAsInline.displayName = 'MemoAnnotatedAsInline';

// NG
export const MemoAnnotatedAsInlineWithTypeReference = React.memo<
  // eslint-disable-next-line react-coding-style/react-memo-type-parameter
  Readonly<{ numList: readonly number[] }>
>((props) => {
  const sum = React.useMemo(() => Arr.sum(props.numList), [props.numList]);

  return <div>{sum}</div>;
});

MemoAnnotatedAsInlineWithTypeReference.displayName =
  'MemoAnnotatedAsInlineWithTypeReference';

// NG
// eslint-disable-next-line react-coding-style/react-memo-props-argument-name
export const ArgSpread = React.memo<Props>(({ numList }) => {
  const sum = React.useMemo(() => Arr.sum(numList), [numList]);

  return <div>{sum}</div>;
});

ArgSpread.displayName = 'ArgSpread';

// NG
// eslint-disable-next-line react-coding-style/component-name
const TooooooooooooooooooooooooLongComponentName = React.memo<Props>(
  (props) => {
    const sum = React.useMemo(() => Arr.sum(props.numList), [props.numList]);

    return <div>{sum}</div>;
  },
);

TooooooooooooooooooooooooLongComponentName.displayName =
  'TooooooooooooooooooooooooLongComponentName';

noop(TooooooooooooooooooooooooLongComponentName);

// NG
export const MismatchedDisplayName = React.memo<Props>(({ numList }) => (
  <div>{numList.length}</div>
));

MismatchedDisplayName.displayName =
  // eslint-disable-next-line react-coding-style/display-name
  'MismatchedDisplayName_WrongDisplayName';

// NG
// eslint-disable-next-line react-coding-style/display-name
export const MissingDisplayName = React.memo<Props>(({ numList }) => (
  <div>{numList.length}</div>
));

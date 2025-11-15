// cspell-ignore-file

import { memo, useMemo, type JSX, type MemoExoticComponent } from 'react';
import { noop } from '../noop.mjs';

type Props = Readonly<{
  numList: readonly number[];
}>;

// OK
export const Ok = memo<Props>((props) => {
  const sum = useMemo(
    () => props.numList.reduce((a, b) => a + b, 0),
    [props.numList],
  );

  return <div>{sum}</div>;
});

Ok.displayName = 'Ok';

// OK
export const NoReturnStatementWithDestructedProps = memo<Props>(
  ({ numList }) => <div>{numList.length}</div>,
);

NoReturnStatementWithDestructedProps.displayName =
  'NoReturnStatementWithDestructedProps';

// OK
export const NoReturnStatementWithoutDestructedProps = memo<Props>((props) => (
  <div>{props.numList.length}</div>
));

NoReturnStatementWithoutDestructedProps.displayName =
  'NoReturnStatementWithoutDestructedProps';

// OK
export const MemoWithoutProps = memo(() => <div>{1}</div>);

MemoWithoutProps.displayName = 'MemoWithoutProps';

// NG
// eslint-disable-next-line react-coding-style/react-memo-type-parameter
export const MemoWithoutPropsWithUnnecessaryTypeArg = memo<never>(() => (
  <div>{1}</div>
));

MemoWithoutPropsWithUnnecessaryTypeArg.displayName =
  'MemoWithoutPropsWithUnnecessaryTypeArg';

// NG
// eslint-disable-next-line react-coding-style/props-type-annotation-style
export const ArgAnnotated = memo<Props>((props: Props) => {
  const sum = useMemo(
    () => props.numList.reduce((a, b) => a + b, 0),
    [props.numList],
  );

  return <div>{sum}</div>;
});

ArgAnnotated.displayName = 'ArgAnnotated';

// NG
export const ArgAnnotatedAsInline = memo<Props>(
  // eslint-disable-next-line react-coding-style/props-type-annotation-style, @typescript-eslint/prefer-readonly-parameter-types, react/prefer-read-only-props
  (props: { numList: readonly number[] }) => {
    const sum = useMemo(
      () => props.numList.reduce((a, b) => a + b, 0),
      [props.numList],
    );

    return <div>{sum}</div>;
  },
);

ArgAnnotatedAsInline.displayName = 'ArgAnnotatedAsInline';

// NG
export const ArgAnnotatedAsInlineWithTypeReference = memo<Props>(
  // eslint-disable-next-line react-coding-style/props-type-annotation-style
  (props: Readonly<{ numList: readonly number[] }>) => {
    const sum = useMemo(
      () => props.numList.reduce((a, b) => a + b, 0),
      [props.numList],
    );

    return <div>{sum}</div>;
  },
);

ArgAnnotatedAsInlineWithTypeReference.displayName =
  'ArgAnnotatedAsInlineWithTypeReference';

// NG
export const MemoWithoutTypeArgument: MemoExoticComponent<
  (props: Props) => JSX.Element
> =
  // eslint-disable-next-line react-coding-style/react-memo-type-parameter
  memo((props) => {
    const sum = useMemo(
      () => props.numList.reduce((a, b) => a + b, 0),
      [props.numList],
    );

    return <div>{sum}</div>;
  });

MemoWithoutTypeArgument.displayName = 'MemoWithoutTypeArgument';

// NG
// @ts-expect-error Parameter 'props' implicitly has an 'any' type.
// eslint-disable-next-line react-coding-style/react-memo-type-parameter, @typescript-eslint/no-explicit-any
export const MemoAnnotatedAsAny = memo<any>((props) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const sum = useMemo(
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
export const MemoAnnotatedAsInline = memo<{ numList: readonly number[] }>(
  (props) => {
    const sum = useMemo(
      () => props.numList.reduce((a, b) => a + b, 0),
      [props.numList],
    );

    return <div>{sum}</div>;
  },
);

MemoAnnotatedAsInline.displayName = 'MemoAnnotatedAsInline';

// NG
export const MemoAnnotatedAsInlineWithTypeReference = memo<
  // eslint-disable-next-line react-coding-style/react-memo-type-parameter
  Readonly<{ numList: readonly number[] }>
>((props) => {
  const sum = useMemo(
    () => props.numList.reduce((a, b) => a + b, 0),
    [props.numList],
  );

  return <div>{sum}</div>;
});

MemoAnnotatedAsInlineWithTypeReference.displayName =
  'MemoAnnotatedAsInlineWithTypeReference';

// NG
// eslint-disable-next-line react-coding-style/react-memo-props-argument-name
export const ArgSpread = memo<Props>(({ numList }) => {
  const sum = useMemo(() => numList.reduce((a, b) => a + b, 0), [numList]);

  return <div>{sum}</div>;
});

ArgSpread.displayName = 'ArgSpread';

// NG
// eslint-disable-next-line react-coding-style/component-name
const TooooooooooooooooooooooooLongComponentName = memo<Props>((props) => {
  const sum = useMemo(
    () => props.numList.reduce((a, b) => a + b, 0),
    [props.numList],
  );

  return <div>{sum}</div>;
});

TooooooooooooooooooooooooLongComponentName.displayName =
  'TooooooooooooooooooooooooLongComponentName';

noop(TooooooooooooooooooooooooLongComponentName);

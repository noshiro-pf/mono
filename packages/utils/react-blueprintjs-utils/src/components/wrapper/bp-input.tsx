import { InputGroup } from '@blueprintjs/core';
import { memoNamed, useTinyObservableEffect } from '@noshiro/react-utils';
import { createTinyObservable, type TinyObservable } from '@noshiro/ts-utils';
import { useCallback, useEffect, useRef } from 'react';

export type BpInputProps = InputGroupPropsOriginal &
  Readonly<{
    onValueChange: (value: string) => void;
    autoFocus?: boolean;
    focus$?: TinyObservable<undefined>;
  }>;

type InputGroupPropsOriginal = React.ComponentProps<typeof InputGroup>;

export const BpInput = memoNamed<BpInputProps>(
  'BpInput',
  ({ value, onValueChange, autoFocus, focus$, ...props }) => {
    const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> =
      useCallback(
        (ev) => {
          onValueChange(ev.target.value);
        },
        [onValueChange],
      );

    const inputRef = useRef<HTMLInputElement | null>(null);

    const focusInput = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    useEffect(() => {
      if (autoFocus === true) {
        focusInput();
      }
    }, [autoFocus, focusInput]);

    useTinyObservableEffect(
      focus$ ?? createTinyObservable<undefined>(),
      focusInput,
    );

    return (
      <InputGroup
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        inputRef={inputRef}
        value={value}
        onChange={onChangeHandler}
      />
    );
  },
);

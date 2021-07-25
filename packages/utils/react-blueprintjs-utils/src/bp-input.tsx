import { InputGroup } from '@blueprintjs/core';
import { memoNamed, useTinyObservableEffect } from '@noshiro/react-utils';
import type { TinyObservable } from '@noshiro/ts-utils';
import { createTinyObservable } from '@noshiro/ts-utils';
import type { ChangeEvent, ComponentProps, FormEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';

type InputGroupPropsOriginal = ComponentProps<typeof InputGroup>;

export type BpInputProps = InputGroupPropsOriginal &
  Readonly<{
    onValueChange: (value: string) => void;
    autoFocus?: boolean;
    focus$?: TinyObservable<undefined>;
  }>;

export const BpInput = memoNamed<BpInputProps>(
  'BpInput',
  ({ value, onValueChange, autoFocus, focus$, ...props }) => {
    const onChangeHandler = useCallback(
      (ev: ChangeEvent<HTMLInputElement> & FormEvent<HTMLElement>) => {
        onValueChange(ev.target.value);
      },
      [onValueChange]
    );

    const inputRef = useRef<HTMLInputElement | null>(null);
    const onFocus = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    useEffect(() => {
      if (autoFocus === true) {
        onFocus();
      }
    }, [autoFocus, onFocus]);

    useTinyObservableEffect(
      focus$ ?? createTinyObservable<undefined>(),
      onFocus
    );

    return (
      <InputGroup
        value={value}
        onChange={onChangeHandler}
        inputRef={inputRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  }
);

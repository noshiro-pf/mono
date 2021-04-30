import { InputGroup, InputGroupProps2 } from '@blueprintjs/core';
import { memoNamed, useTinyObservableEffect } from '@noshiro/react-utils';
import { createTinyObservable, TinyObservable } from '@noshiro/ts-utils';
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef } from 'react';

type Props = InputGroupProps2 &
  Readonly<{
    onValueChange: (value: string) => void;
    autoFocus?: boolean;
    focus$?: TinyObservable<undefined>;
  }>;

export const BpInput = memoNamed<Props>(
  'BpInput',
  ({ value, onValueChange, autoFocus, focus$, ...props }) => {
    const onChangeHandler = useCallback(
      (event: ChangeEvent<HTMLInputElement> & FormEvent<HTMLElement>) => {
        onValueChange(event.target.value);
      },
      [onValueChange]
    );

    const inputRef = useRef<HTMLInputElement | null>(null);
    const focus = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    useEffect(() => {
      if (autoFocus === true) {
        focus();
      }
    }, [autoFocus, focus]);

    useTinyObservableEffect(focus$ ?? createTinyObservable<undefined>(), focus);

    return (
      <InputGroup
        value={value}
        onChange={onChangeHandler}
        inputRef={inputRef}
        {...props}
      />
    );
  }
);

import { IInputGroupProps, InputGroup } from '@blueprintjs/core';
import { memoNamed, useTinyObservableEffect } from '@mono/react-utils';
import { TinyObservable } from '@mono/ts-utils';
import { useCallback, useEffect, useRef } from 'react';

interface Props extends IInputGroupProps {
  onValueChange: (value: string) => void;
  autoFocus?: boolean;
  focus$?: TinyObservable<void>;
}

export const BpInput = memoNamed<Props>(
  'BpInput',
  ({ value, onValueChange, autoFocus, focus$, ...props }) => {
    const onChangeHandler = useCallback(
      (
        event: React.FormEvent<HTMLElement> &
          React.ChangeEvent<HTMLInputElement>
      ) => {
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

    useTinyObservableEffect(focus$ ?? new TinyObservable(), focus);

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

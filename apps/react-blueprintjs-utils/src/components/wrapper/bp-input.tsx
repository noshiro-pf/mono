import { InputGroup } from '@blueprintjs/core';
import * as React from 'react';
import {
  createTinyObservable,
  memoNamed,
  useTinyObservableEffect,
  type TinyObservable,
} from 'react-utils';

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
      React.useCallback(
        (ev) => {
          onValueChange(ev.target.value);
        },
        [onValueChange],
      );

    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const focusInput = React.useCallback(() => {
      inputRef.current?.focus();
    }, []);

    React.useEffect(() => {
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

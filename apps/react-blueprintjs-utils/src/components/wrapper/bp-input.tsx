import { InputGroup } from '@blueprintjs/core';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { source, type Observable as SynstateObservable } from 'synstate';
import { useObservableEffect } from 'synstate-react-hooks';

export type BpInputProps = InputGroupPropsOriginal &
  Readonly<{
    onValueChange: (value: string) => void;
    autoFocus?: boolean;
    focus$?: SynstateObservable<undefined>;
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

    useObservableEffect(focus$ ?? source<undefined>(), focusInput);

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

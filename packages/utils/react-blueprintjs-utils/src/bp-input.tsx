import { InputGroup } from '@blueprintjs/core';
import { memoNamed, useTinyObservableEffect } from '@noshiro/react-utils';
import { createTinyObservable, type TinyObservable } from '@noshiro/ts-utils';
import {
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type ComponentProps,
  type FormEvent,
} from 'react';

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
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
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
        inputRef={inputRef}
        value={value}
        onChange={onChangeHandler}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  }
);

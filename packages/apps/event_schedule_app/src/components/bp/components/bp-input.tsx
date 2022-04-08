import { InputGroup } from '@blueprintjs/core';
import type { ChangeEvent, ComponentProps, FormEvent } from 'react';
import { useRef } from 'react';

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
      focusInput
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

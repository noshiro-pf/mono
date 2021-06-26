import { TextArea } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { ChangeEvent, ComponentProps } from 'react';
import { useCallback } from 'react';

type TextAreaPropsOriginal = ComponentProps<typeof TextArea>;

export type BpTextAreaProps = Readonly<{
  onValueChange: (value: string) => void;
}> &
  TextAreaPropsOriginal;

export const BpTextArea = memoNamed<BpTextAreaProps>(
  'BpTextArea',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
      (ev: ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(ev.target.value);
      },
      [onValueChange]
    );

    return <TextArea value={value} onChange={onChangeHandler} {...props} />;
  }
);

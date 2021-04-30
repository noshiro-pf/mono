import { TextArea, TextAreaProps } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { ChangeEvent, useCallback } from 'react';

type Props = Readonly<{ onValueChange: (value: string) => void }> &
  TextAreaProps;

export const BpTextArea = memoNamed<Props>(
  'BpTextArea',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(event.target.value);
      },
      [onValueChange]
    );

    return <TextArea value={value} onChange={onChangeHandler} {...props} />;
  }
);

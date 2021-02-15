import { ITextAreaProps, TextArea } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

type Props = ITextAreaProps &
  Readonly<{
    onValueChange: (value: string) => void;
  }>;

export const BpTextArea = memoNamed<Props>(
  'BpTextArea',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(event.target.value);
      },
      [onValueChange]
    );

    return <TextArea value={value} onChange={onChangeHandler} {...props} />;
  }
);

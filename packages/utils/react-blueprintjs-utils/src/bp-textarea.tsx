import type { TextAreaProps } from '@blueprintjs/core';
import { TextArea } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { ChangeEvent } from 'react';
import { useCallback } from 'react';

type Props = Readonly<{ onValueChange: (value: string) => void }> &
  TextAreaProps;

export const BpTextArea = memoNamed<Props>(
  'BpTextArea',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      (ev: ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(ev.target.value);
      },
      [onValueChange]
    );

    return <TextArea value={value} onChange={onChangeHandler} {...props} />;
  }
);

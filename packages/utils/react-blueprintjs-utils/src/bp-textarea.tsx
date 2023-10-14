import { TextArea } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

type TextAreaPropsOriginal = React.ComponentProps<typeof TextArea>;

export type BpTextAreaProps = Readonly<{
  onValueChange: (value: string) => void;
}> &
  TextAreaPropsOriginal;

export const BpTextArea = memoNamed<BpTextAreaProps>(
  'BpTextArea',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(ev.target.value);
      },
      [onValueChange],
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TextArea value={value} onChange={onChangeHandler} {...props} />;
  },
);

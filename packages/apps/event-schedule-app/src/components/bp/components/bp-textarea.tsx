import { TextArea } from '@blueprintjs/core';
import { type ComponentProps } from 'react';

type TextAreaPropsOriginal = ComponentProps<typeof TextArea>;

export type BpTextAreaProps = Readonly<{
  onValueChange: (value: string) => void;
}> &
  TextAreaPropsOriginal;

export const BpTextArea = memoNamed<BpTextAreaProps>(
  'BpTextArea',
  ({ value, onValueChange, ...props }) => {
    const onChangeHandler = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(ev.target.value);
      },
      [onValueChange]
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TextArea value={value} onChange={onChangeHandler} {...props} />;
  }
);

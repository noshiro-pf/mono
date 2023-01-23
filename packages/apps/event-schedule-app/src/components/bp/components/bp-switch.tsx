import { Switch } from '@blueprintjs/core';
import { type ComponentProps } from 'react';

type SwitchPropsOriginal = ComponentProps<typeof Switch>;

export type BpSwitchProps = Readonly<{ onToggle: () => void }> &
  SwitchPropsOriginal;

export const BpSwitch = memoNamed<BpSwitchProps>(
  'BpSwitch',
  ({ checked, onToggle, ...props }) => {
    const onChangeHandler = useCallback(() => {
      onToggle();
    }, [onToggle]);

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Switch checked={checked} onChange={onChangeHandler} {...props} />;
  }
);

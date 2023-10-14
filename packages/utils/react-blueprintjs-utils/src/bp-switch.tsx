import { Switch } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

type SwitchPropsOriginal = React.ComponentProps<typeof Switch>;

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
  },
);

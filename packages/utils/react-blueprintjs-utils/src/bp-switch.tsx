import { Switch } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { ComponentProps } from 'react';
import { useCallback } from 'react';

type SwitchPropsOriginal = ComponentProps<typeof Switch>;

export type BpSwitchProps = Readonly<{ onToggle: () => void }> &
  SwitchPropsOriginal;

export const BpSwitch = memoNamed<BpSwitchProps>(
  'BpSwitch',
  ({ checked, onToggle, ...props }) => {
    const onChangeHandler = useCallback(() => {
      onToggle();
    }, [onToggle]);

    return <Switch checked={checked} onChange={onChangeHandler} {...props} />;
  }
);

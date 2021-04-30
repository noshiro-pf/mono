import { Switch, SwitchProps } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

type Props = Readonly<{ onToggle: () => void }> & SwitchProps;

export const BpSwitch = memoNamed<Props>(
  'BpSwitch',
  ({ checked, onToggle, ...props }) => {
    const onChangeHandler = useCallback(() => {
      onToggle();
    }, [onToggle]);

    return <Switch checked={checked} onChange={onChangeHandler} {...props} />;
  }
);

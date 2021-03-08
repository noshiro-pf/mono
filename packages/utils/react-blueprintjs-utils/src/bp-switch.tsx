import { ISwitchProps, Switch } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

interface Props extends ISwitchProps {
  onToggle: () => void;
}

export const BpSwitch = memoNamed<Props>(
  'BpSwitch',
  ({ checked, onToggle, ...props }) => {
    const onChangeHandler = useCallback(() => {
      onToggle();
    }, [onToggle]);

    return <Switch checked={checked} onChange={onChangeHandler} {...props} />;
  }
);

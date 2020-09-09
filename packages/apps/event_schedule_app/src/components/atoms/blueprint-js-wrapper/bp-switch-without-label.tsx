import { ISwitchProps, Switch } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { CSSProperties } from 'react';

const style: CSSProperties = {
  margin: 0,
};

interface Props extends Omit<ISwitchProps, 'label' | 'labelElement'> {
  onToggle: () => void;
}

export const BpSwitchWithoutLabel = memoNamed<Props>(
  'BpSwitchWithoutLabel',
  ({ checked, onToggle, ...props }) => (
    <Switch
      labelElement={undefined}
      label={undefined}
      style={style}
      checked={checked}
      onChange={onToggle}
      {...props}
    />
  )
);

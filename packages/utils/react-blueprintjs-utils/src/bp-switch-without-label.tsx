import { ISwitchProps, Switch } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import { CSSProperties } from 'react';

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

const style: CSSProperties = {
  margin: 0,
};

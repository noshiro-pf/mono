import { ISwitchProps, Switch } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { CSSProperties } from 'react';

type Props = Omit<ISwitchProps, 'label' | 'labelElement'> &
  Readonly<{
    onToggle: () => void;
  }>;

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

import type { SwitchProps } from '@blueprintjs/core';
import { Switch } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { StrictOmit } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';

type Props = Readonly<{ onToggle: () => void }> &
  StrictOmit<SwitchProps, 'label' | 'labelElement'>;

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

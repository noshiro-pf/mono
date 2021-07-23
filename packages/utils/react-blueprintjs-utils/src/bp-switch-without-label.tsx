import { Switch } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { StrictOmit } from '@noshiro/ts-utils';
import type { ComponentProps, CSSProperties } from 'react';

type SwitchPropsOriginal = ComponentProps<typeof Switch>;

export type BpSwitchWithoutLabelProps = Readonly<{ onToggle: () => void }> &
  StrictOmit<SwitchPropsOriginal, 'label' | 'labelElement'>;

export const BpSwitchWithoutLabel = memoNamed<BpSwitchWithoutLabelProps>(
  'BpSwitchWithoutLabel',
  ({ checked, onToggle, ...props }) => (
    <Switch
      checked={checked}
      label={undefined}
      labelElement={undefined}
      style={style}
      onChange={onToggle}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  )
);

const style: CSSProperties = {
  margin: 0,
};

import { Switch } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';

export type BpSwitchWithoutLabelProps = Omit<
  SwitchPropsOriginal,
  'label' | 'labelElement'
> &
  Readonly<{ onToggle: () => void }>;

type SwitchPropsOriginal = React.ComponentProps<typeof Switch>;

export const BpSwitchWithoutLabel = memoNamed<BpSwitchWithoutLabelProps>(
  'BpSwitchWithoutLabel',
  ({ checked, onToggle, ...props }) => (
    <Switch
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      checked={checked}
      label={undefined}
      labelElement={undefined}
      style={style}
      onChange={onToggle}
    />
  ),
);

const style: React.CSSProperties = {
  margin: 0,
} as const;

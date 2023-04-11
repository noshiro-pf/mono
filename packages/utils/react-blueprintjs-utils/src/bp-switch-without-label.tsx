import { Switch } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';

type SwitchPropsOriginal = React.ComponentProps<typeof Switch>;

export type BpSwitchWithoutLabelProps = Omit<
  SwitchPropsOriginal,
  'label' | 'labelElement'
> &
  Readonly<{ onToggle: () => void }>;

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

const style: React.CSSProperties = {
  margin: 0,
};

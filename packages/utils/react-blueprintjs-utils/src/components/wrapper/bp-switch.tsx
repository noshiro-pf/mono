import { Switch } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

export type BpSwitchProps = Omit<SwitchPropsOriginal, 'onChange'> &
  Readonly<{
    onToggle: () => void;
    noMargin?: boolean;
  }>;

type SwitchPropsOriginal = React.ComponentProps<typeof Switch>;

export const BpSwitch = memoNamed<BpSwitchProps>(
  'BpSwitch',
  ({ checked, noMargin, onToggle, ...props }) => {
    const onChangeHandler = useCallback(() => {
      onToggle();
    }, [onToggle]);

    return noMargin === true ? (
      <SwitchWithoutMargin
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        checked={checked}
        onChange={onChangeHandler}
      />
    ) : (
      <Switch
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        checked={checked}
        onChange={onChangeHandler}
      />
    );
  },
);

export const SwitchWithoutMargin = styled(Switch)`
  margin: 0 !important;
`;

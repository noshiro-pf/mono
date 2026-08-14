import { Switch } from '@blueprintjs/core';
import styled from '@emotion/styled';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { type StrictOmit } from 'ts-type-forge';

export type BpSwitchProps = StrictOmit<SwitchPropsOriginal, 'onChange'> &
  Readonly<{
    onToggle: () => void;
    noMargin?: boolean;
  }>;

type SwitchPropsOriginal = React.ComponentProps<typeof Switch>;

export const BpSwitch = memoNamed<BpSwitchProps>(
  'BpSwitch',
  ({ checked, noMargin, onToggle, ...props }) => {
    const onChangeHandler = React.useCallback(() => {
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

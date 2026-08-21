import { Button } from '@blueprintjs/core';
import * as React from 'react';
import { memoNamed } from 'react-utils';

export type BpButtonProps = ButtonPropsOriginal &
  Readonly<{ nowrap?: boolean }>;

type ButtonPropsOriginal = React.ComponentProps<typeof Button>;

export const BpButton = memoNamed<BpButtonProps>(
  'BpButton',
  ({ nowrap, ...props }) => {
    const style = React.useMemo<React.CSSProperties>(
      () => ({
        ...props.style,
        outline: 'none',
        whiteSpace: (nowrap ?? false) ? 'nowrap' : 'inherit',
      }),
      [props.style, nowrap],
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Button {...props} style={style} />;
  },
);

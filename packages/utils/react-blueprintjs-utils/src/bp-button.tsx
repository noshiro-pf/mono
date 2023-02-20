import { Button } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';

type ButtonPropsOriginal = React.ComponentProps<typeof Button>;

export type BpButtonProps = ButtonPropsOriginal &
  Readonly<{ nowrap?: boolean }>;

export const BpButton = memoNamed<BpButtonProps>(
  'BpButton',
  ({ nowrap, ...props }) => {
    const style = useMemo<React.CSSProperties>(
      () => ({
        ...props.style,
        outline: 'none',
        whiteSpace: nowrap ?? false ? 'nowrap' : 'inherit',
      }),
      [props.style, nowrap]
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Button {...props} style={style} />;
  }
);

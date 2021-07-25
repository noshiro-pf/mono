import { Button } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { ComponentProps, CSSProperties } from 'react';
import { useMemo } from 'react';

type ButtonPropsOriginal = ComponentProps<typeof Button>;

export type BpButtonProps = ButtonPropsOriginal &
  Readonly<{ nowrap?: boolean }>;

export const BpButton = memoNamed<BpButtonProps>(
  'BpButton',
  ({ nowrap, ...props }) => {
    const style = useMemo<CSSProperties>(
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

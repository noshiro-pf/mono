import { Button, IButtonProps } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { CSSProperties, useMemo } from 'react';

interface Props extends IButtonProps, React.HTMLAttributes<HTMLElement> {
  nowrap?: boolean;
}

export const BpButton = memoNamed<Props>(
  'BpTimePicker',
  ({ nowrap, ...props }) => {
    const style = useMemo<CSSProperties>(
      () => ({
        ...props.style,
        outline: 'none',
        whiteSpace: nowrap ?? false ? 'nowrap' : 'inherit',
      }),
      [props.style, nowrap]
    );

    return <Button {...props} style={style} />;
  }
);

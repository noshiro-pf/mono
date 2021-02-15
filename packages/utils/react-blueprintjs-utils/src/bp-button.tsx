import { Button, IButtonProps } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { CSSProperties, useMemo } from 'react';

type Props = IButtonProps &
  React.HTMLAttributes<HTMLElement> &
  Readonly<{
    nowrap?: boolean;
  }>;

export const BpButton = memoNamed<Props>('BpButton', ({ nowrap, ...props }) => {
  const style = useMemo<CSSProperties>(
    () => ({
      ...props.style,
      outline: 'none',
      whiteSpace: nowrap ?? false ? 'nowrap' : 'inherit',
    }),
    [props.style, nowrap]
  );

  return <Button {...props} style={style} />;
});

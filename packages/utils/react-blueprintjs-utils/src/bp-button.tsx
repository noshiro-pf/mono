import type { ButtonProps } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { CSSProperties, HTMLAttributes } from 'react';
import { useMemo } from 'react';

type Props = ButtonProps &
  HTMLAttributes<HTMLElement> &
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

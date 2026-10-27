import { css } from '@emotion/react';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { hslToStr, type Hsl } from 'ts-utils-additional';

type Props = Readonly<{
  hsl: Hsl;
}>;

export const ColorItem = memoNamed<Props>('ColorItem', (props) => {
  const style = React.useMemo(
    () => ({ backgroundColor: hslToStr(props.hsl) }),
    [props.hsl],
  );

  return (
    <div
      css={css`
        width: 30px;
        height: 30px;
        border-radius: 25%;
      `}
      style={style}
    />
  );
});

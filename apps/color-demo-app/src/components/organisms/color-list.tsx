import { css } from '@emotion/react';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Arr } from 'ts-data-forge';
import { type Percent } from 'ts-type-forge';
import { hsl as toHsl, type Hue } from 'ts-utils-additional';
import { ColorItem } from '../atoms/index.mjs';

type Props = Readonly<{
  hueList: readonly Hue[];
  saturation: Percent;
  lightness: Percent;
}>;

export const ColorList = memoNamed<Props>('ColorList', (props) => {
  const hslList = React.useMemo(
    () =>
      Arr.map(props.hueList, (hue, index) => ({
        index,
        // The `hsl` constructor rather than an array literal: the literal
        // infers `(Hue | Percent)[]`, which is neither readonly nor a tuple.
        hsl: toHsl(hue, props.saturation, props.lightness),
      })),
    [props.hueList, props.lightness, props.saturation],
  );

  return (
    <div
      css={css`
        padding: 10px;
      `}
    >
      <div>{'色相リスト'}</div>
      <div
        css={css`
          display: flex;
          flex-direction: row;
          padding: 10px;
        `}
      >
        {hslList.map(({ hsl, index }) => (
          <div
            key={index}
            css={css`
              padding: 3px;
            `}
          >
            <ColorItem hsl={hsl} />
          </div>
        ))}
      </div>
    </div>
  );
});

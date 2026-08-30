import { css } from '@emotion/react';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { descriptionFontColor } from '../../constants/index.mjs';

type Props = Readonly<{ text: string; error?: boolean; color?: string }>;

export const Description = memoNamed<Props>(
  'Description',
  ({ text, error = false, color }) => {
    const style = React.useMemo(
      () => ({
        color:
          color ??
          (error ? descriptionFontColor.error : descriptionFontColor.normal),
      }),
      [color, error],
    );

    return (
      <div
        css={css`
          font-size: smaller;
          margin-bottom: 5px;
        `}
        style={style}
      >
        {text}
      </div>
    );
  },
);

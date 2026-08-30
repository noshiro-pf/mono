import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import { defaultIconPoint } from '../../../constants/index.mjs';

const s = defaultIconPoint.good.toString();

export const AnswerIconGoodPoint = memoNamed('AnswerIconGoodPoint', () => (
  <div
    css={css`
      display: flex;
      justify-content: flex-end;
      width: 75px;
      padding-right: 39px;
    `}
  >
    {s}
  </div>
));

import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import { defaultIconPoint } from '../../../constants/index.mjs';

const s = defaultIconPoint.poor.toString();

export const AnswerIconPoorPoint = memoNamed('AnswerIconPoorPoint', () => (
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

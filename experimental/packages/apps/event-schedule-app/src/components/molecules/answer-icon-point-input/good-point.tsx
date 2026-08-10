import { defaultIconPoint } from '../../../constants';

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

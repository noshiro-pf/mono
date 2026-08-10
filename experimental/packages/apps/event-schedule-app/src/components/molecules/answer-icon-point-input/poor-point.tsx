import { defaultIconPoint } from '../../../constants';

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

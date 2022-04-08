import { defaultIconPoint } from '../../../constants';

const s = defaultIconPoint.good.toString();

export const AnswerIconGoodPoint = memoNamed('AnswerIconGoodPoint', () => (
  <Div>{s}</Div>
));

const Div = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 75px;
  padding-right: 39px;
`;

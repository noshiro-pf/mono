import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { defaultIconPoint } from '../../../constants';

const s = defaultIconPoint.poor.toString();

export const AnswerIconPoorPoint = memoNamed('AnswerIconPoorPoint', () => (
  <Div>{s}</Div>
));

const Div = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 75px;
  padding-right: 39px;
`;

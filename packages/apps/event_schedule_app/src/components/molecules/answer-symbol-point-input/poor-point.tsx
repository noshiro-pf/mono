import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { defaultSymbolPoint } from '../../../constants';

const s = defaultSymbolPoint.poor.toString();

export const AnswerSymbolPoorPoint = memoNamed('AnswerSymbolPoorPoint', () => (
  <Div>{s}</Div>
));

const Div = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 75px;
  padding-right: 39px;
`;

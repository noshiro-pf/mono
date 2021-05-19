import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';

type Props = Readonly<{ n: number; opacity: number }>;

export const DiceNumber = memoNamed<Props>('DiceNumber', ({ n, opacity }) => (
  <Wrapper style={{ borderColor: `rgba(143, 186, 255, ${opacity})` }}>
    {n < 1 ? 0 : n}
  </Wrapper>
));

const Wrapper = styled.div`
  background-color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  border-color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
`;

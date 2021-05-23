import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';

type Props = Readonly<{ message: string }>;

export const GameMessage = memoNamed<Props>('GameMessage', ({ message }) => (
  <Wrapper>{message}</Wrapper>
));

const Wrapper = styled('div')`
  /* background-color: #d8d8d8; */
`;

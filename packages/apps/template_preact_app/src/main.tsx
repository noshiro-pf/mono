import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';

export const Main = memoNamed('Main', () => <Root>{'Hello'}</Root>);

const Root = styled('div')`
  min-height: 100vh;
`;

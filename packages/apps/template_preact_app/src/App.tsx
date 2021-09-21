import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';

export const App = memoNamed('App', () => <Root>{'Hello'}</Root>);

const Root = styled('div')`
  min-height: 100vh;
`;

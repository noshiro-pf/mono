import { styled } from 'goober';
import { memoNamed } from 'preact-utils';
import { Calculator } from './components/index.mjs';

export const App = memoNamed('App', () => (
  <Root data-e2e={'root'}>
    <Calculator />
  </Root>
));

const Root = styled('div')`
  min-height: 100vh;
  min-width: 700px;
  max-width: 1000px;
`;

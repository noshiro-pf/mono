import { Calculator } from './components';

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

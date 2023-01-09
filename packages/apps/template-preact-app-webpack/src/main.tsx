export const Main = memoNamed('Main', () => <Root>{'Hello'}</Root>);

const Root = styled('div')`
  min-height: 100vh;
`;

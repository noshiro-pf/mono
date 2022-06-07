import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';

export const Main = memoNamed('Main', () => <Root>{'Hello'}</Root>);

const Root = styled.div`
  min-height: 100vh;
`;

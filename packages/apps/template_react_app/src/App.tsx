import { memoNamed } from '@noshiro/react-utils';
import type { FC } from 'react';
import styled from 'styled-components';

export const App: FC = memoNamed('App', () => <Root />);

const Root = styled.div`
  min-height: 100vh;
`;

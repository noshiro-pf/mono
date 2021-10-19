import { NumericInput } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { NumericInputView } from './components/numeric-input';

export const Main = memoNamed('Main', () => (
  <Root>
    <h1>{'Blueprint.js Playground'}</h1>
    <MarginBox>
      <MarginBox>
        <NumericInput disabled={true} fill={true} value={0} />
      </MarginBox>
      <MarginBox>
        <NumericInputView disabled={true} fill={true} value={0} />
      </MarginBox>
    </MarginBox>
  </Root>
));

const Root = styled.div`
  min-height: 100vh;
  padding: 20px;
`;

const MarginBox = styled.div`
  margin: 10px;
`;

import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { InputGroupView } from './components/input-group-view';
import { NumericInputView } from './components/numeric-input-view';

export const Main = memoNamed('Main', () => (
  <Root>
    <h1>{'Blueprint.js Playground (styled-components)'}</h1>

    <h2>{'NumericInput'}</h2>
    <MarginBox>
      <NumericInputView disabled={false} fill={true} value={0} />
    </MarginBox>
    <MarginBox>
      <NumericInputView disabled={true} fill={true} value={0} />
    </MarginBox>

    <h2>{'InputGroup'}</h2>
    <MarginBox>
      <InputGroupView value={'aaa'} onChange={noop} />
    </MarginBox>
    <MarginBox>
      <InputGroupView disabled={true} value={'aaa'} onChange={noop} />
    </MarginBox>
    <MarginBox>
      <InputGroupView
        placeholder={'placeholder'}
        value={undefined}
        onChange={noop}
      />
    </MarginBox>
  </Root>
));

const Root = styled.div`
  min-height: 100vh;
  padding: 20px;
`;

const MarginBox = styled.div`
  margin: 10px;

  & > * {
    margin: 10px;
  }
`;

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { noop, NumericInputView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { InputGroupView } from './components/index.mjs';

export const App = memoNamed('App', () => (
  <div
    css={css`
      min-height: 100vh;
      padding: 20px;
    `}
    data-e2e={'root'}
  >
    <h1>{'Blueprint.js Playground (styled in scratch)'}</h1>

    <h2>{'NumericInput'}</h2>
    <MarginBox>
      <NumericInputView disabled={false} fillSpace valueAsStr={'0'} />
    </MarginBox>
    <MarginBox>
      <NumericInputView disabled fillSpace valueAsStr={'0'} />
    </MarginBox>

    <h2>{'InputGroup'}</h2>
    <MarginBox>
      <InputGroupView value={'aaa'} onChange={noop} />
    </MarginBox>
    <MarginBox>
      <InputGroupView disabled value={'aaa'} onChange={noop} />
    </MarginBox>
    <MarginBox>
      <InputGroupView
        placeholder={'placeholder'}
        value={undefined}
        onChange={noop}
      />
    </MarginBox>
  </div>
));

const MarginBox = styled.div`
  margin: 10px;

  & > * {
    margin: 10px;
  }
`;

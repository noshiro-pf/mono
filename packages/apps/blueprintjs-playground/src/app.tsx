import { InputGroup, NumericInput } from '@blueprintjs/core';

export const App = memoNamed('App', () => (
  <div
    css={css`
      min-height: 100vh;
      padding: 20px;
    `}
  >
    <h1>{'Blueprint.js Playground'}</h1>

    <h2>{'NumericInput'}</h2>
    <MarginBox>
      <NumericInput disabled={false} fill={true} value={0} />
    </MarginBox>
    <MarginBox>
      <NumericInput disabled={true} fill={true} value={0} />
    </MarginBox>

    <h2>{'InputGroup'}</h2>
    <MarginBox>
      <InputGroup value={'aaa'} onChange={noop} />
    </MarginBox>
    <MarginBox>
      <InputGroup disabled={true} value={'aaa'} onChange={noop} />
    </MarginBox>
    <MarginBox>
      <InputGroup
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

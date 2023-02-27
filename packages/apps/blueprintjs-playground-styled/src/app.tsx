import { InputGroupView, NumericInputView } from './components';

export const App = memoNamed('App', () => (
  <div
    css={css`
      min-height: 100vh;
      padding: 20px;
    `}
    data-cy={'root'}
  >
    <h1>{'Blueprint.js Playground (styled in scratch)'}</h1>

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
  </div>
));

const MarginBox = styled.div`
  margin: 10px;

  & > * {
    margin: 10px;
  }
`;

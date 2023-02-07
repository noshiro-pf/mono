import {
  inputAreaString$,
  outputAreaString$,
  setInputAreaString,
} from '../state';
import { CodeArea } from './code-area';

export const App = memoNamed('App', () => {
  const inputAreaString = useObservableValue(inputAreaString$);
  const outputAreaString = useObservableValue(outputAreaString$);

  return (
    <div
      css={css`
        padding: 10px;
        min-height: 100vh;
      `}
    >
      <h2>{'(Untyped) lambda calculus'}</h2>
      <div
        css={css`
          padding: 10px;
        `}
      >
        {'expr ::= x | (lambda x. expr) | (expr expr)'}
      </div>
      <TextAreaWrapper>
        <div>{'Input:'}</div>
        <CodeArea
          maxHeightPx={500}
          minHeightPx={100}
          value={inputAreaString}
          valueChange={setInputAreaString}
        />
      </TextAreaWrapper>

      <TextAreaWrapper>
        <div>{'Output:'}</div>
        <CodeArea
          maxHeightPx={800}
          minHeightPx={500}
          value={outputAreaString ?? 'Parse error.'}
        />
      </TextAreaWrapper>
    </div>
  );
});

const TextAreaWrapper = styled.div`
  padding: 10px;
  width: 100%;
`;

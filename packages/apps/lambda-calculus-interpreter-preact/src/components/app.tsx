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
    <Root>
      <h2>{'(Untyped) lambda calculus'}</h2>
      <Description>{'expr ::= x | (lambda x. expr) | (expr expr)'}</Description>
      <TextAreaWrapper>
        <div>{'Input:'}</div>
        <CodeArea
          cyId={'input-area'}
          maxHeightPx={500}
          minHeightPx={100}
          value={inputAreaString}
          valueChange={setInputAreaString}
        />
      </TextAreaWrapper>

      <TextAreaWrapper>
        <div>{'Output:'}</div>
        <CodeArea
          cyId={'output-area'}
          maxHeightPx={800}
          minHeightPx={500}
          value={outputAreaString ?? 'Parse error.'}
        />
      </TextAreaWrapper>
    </Root>
  );
});

const Root = styled('div')`
  padding: 10px;
  min-height: 100vh;
`;

const Description = styled('div')`
  padding: 10px;
`;

const TextAreaWrapper = styled('div')`
  padding: 10px;
  width: 100%;
`;

import { CodeArea } from './code-area';
import { useLambdaEval } from './use-lambda-eval';

export const App = memoNamed('App', () => {
  const { inputAreaString, outputAreaString, setInputAreaString } =
    useLambdaEval('((+ 2) 3)', 'Parse error.');

  return (
    <Root>
      <h2>{'(Untyped) lambda calculus'}</h2>
      <Description>{'expr ::= x | (lambda x. expr) | (expr expr)'}</Description>
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
          value={outputAreaString}
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

import { styled } from '@mono/solid-styled-components';
import { JSX } from 'solid-js';
import { toLambdaEvaluated } from '../functions/to-lambda-eval-operator';
import { useStateAsStream, useStreamValue } from '../utils/use-stream-value';
import { CodeArea } from './code-area';

const inputAreaStringInitialValue: string = '((+ 2) 3)';

export const App = (): JSX.Element => {
  const [inputAreaString$, setInputAreaString] = useStateAsStream<string>(
    inputAreaStringInitialValue
  );

  const inputAreaString = useStreamValue(
    inputAreaString$,
    inputAreaStringInitialValue
  );

  const outputAreaString$ = inputAreaString$.pipe(toLambdaEvaluated);

  const outputAreaString = useStreamValue(outputAreaString$, '');

  return (
    <Root>
      <Title>(Untyped) lambda calculus</Title>
      <Description>expr ::= x | (lambda x. expr) | (expr expr)</Description>
      <TextAreaWrapper>
        <div>Input:</div>
        <InputAreaStyled
          value={inputAreaString}
          valueChange={setInputAreaString}
        />
      </TextAreaWrapper>

      <TextAreaWrapper>
        <div>Output:</div>
        <OutputAreaStyled value={outputAreaString} />
      </TextAreaWrapper>
    </Root>
  );
};

const Root = styled('div')`
  padding: 10px;
`;

const Title = styled('h2')``;

const Description = styled('div')`
  padding: 10px;
`;

const TextAreaWrapper = styled('div')`
  padding: 10px;
  width: 100%;
`;

const CodeAreaStyled = styled(CodeArea)`
  /* max-width: 100%;
  min-width: 600px; */
  width: 100%;
`;

const InputAreaStyled = styled(CodeAreaStyled)`
  min-height: 100px;
  max-height: 500px;
`;

const OutputAreaStyled = styled(CodeAreaStyled)`
  min-height: 500px;
  max-height: 800px;
`;

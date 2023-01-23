import { styled } from '@noshiro/solid-styled-components';
import { type JSX } from 'solid-js';
import { useObservableState, useObservableValue } from '../utils';
import { CodeArea } from './code-area';
import { useLambdaEval } from './use-lambda-eval';

export const Main = (): JSX.Element => {
  const [inputAreaString$, setInputAreaString] =
    useObservableState<string>('((+ 2) 3)');

  const outputAreaString$ = useLambdaEval(inputAreaString$);

  /* extract values */
  const inputAreaString = useObservableValue(inputAreaString$);
  const outputAreaString = useObservableValue(outputAreaString$, '');

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
  min-height: 100vh;
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

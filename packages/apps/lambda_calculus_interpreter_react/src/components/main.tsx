import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { CodeArea } from './input-area';
import { useLambdaEval } from './use-lambda-eval';

export const Main = memoNamed('Main', () => {
  const { inputAreaString, outputAreaString, setInputAreaString } =
    useLambdaEval('((+ 2) 3)', 'Parse error.');

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
});

const Root = styled.div`
  padding: 10px;
`;

const Title = styled.h2``;

const Description = styled.div`
  padding: 10px;
`;

const TextAreaWrapper = styled.div`
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

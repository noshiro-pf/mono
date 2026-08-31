import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { memoNamed } from 'react-utils';
import { useObservableValue } from 'synstate-react-hooks';
import { CodeArea } from './components/index.mjs';
import {
  inputAreaString$,
  outputAreaString$,
  setInputAreaString,
} from './state.mjs';

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
    </div>
  );
});

const TextAreaWrapper = styled.div`
  padding: 10px;
  width: 100%;
`;

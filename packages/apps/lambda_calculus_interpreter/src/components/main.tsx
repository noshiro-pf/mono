import { useStateAsStream, useStreamValue } from '@mono/react-rxjs-utils';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { useLambdaEval } from '../functions/hooks/use-lambda-eval';
import { MainView } from './main-view';

export const Main = memoNamed('Main', () => {
  const [inputAreaString$, setInputAreaString] = useStateAsStream<string>(
    '((+ 2) 3)'
  );

  const outputString$ = useLambdaEval(inputAreaString$);

  /* extract values */
  const inputAreaString = useStreamValue(inputAreaString$, '');
  const outputAreaString = useStreamValue(outputString$, '');

  return (
    <MainView
      inputAreaString={inputAreaString}
      inputAreaStringChange={setInputAreaString}
      outputAreaString={outputAreaString}
    />
  );
});

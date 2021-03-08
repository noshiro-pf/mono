import { useStateAsStream, useStreamValue } from '@noshiro/react-rxjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { MainView } from './main-view';
import { useLambdaEval } from './use-lambda-eval';

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

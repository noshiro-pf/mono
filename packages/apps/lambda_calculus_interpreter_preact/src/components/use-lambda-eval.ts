import {
  evalSequence,
  parseLambdaTerm,
  termToString,
} from '@noshiro/lambda-calculus-interpreter-core';
import { debounceTimeI, mapI } from '@noshiro/syncflow';
import {
  useObservable,
  useObservableState,
  useObservableValue,
} from '@noshiro/syncflow-preact-hooks';
import { mapNullable, pipe } from '@noshiro/ts-utils';

export const useLambdaEval = (
  initialInput: string,
  parseErrorMessage: string
): {
  inputAreaString: string;
  outputAreaString: string;
  setInputAreaString: (input: string) => void;
} => {
  const [inputAreaString$, setInputAreaString] =
    useObservableState<string>(initialInput);

  const outputAreaString$ = useObservable<string | undefined>(() =>
    inputAreaString$.chain(debounceTimeI(200 /* ms */)).chain(
      mapI(
        (input) =>
          pipe(input)
            .chain(parseLambdaTerm)
            .chain((a) => mapNullable(a, evalSequence))
            .chain((a) => mapNullable(a, (seq) => seq.map(termToString)))
            .chain((a) =>
              mapNullable(a, (seq) =>
                seq.map((s, i) => `${i}.\t${s}`).join('\n')
              )
            ).value
      )
    )
  );

  /* extract values */
  const inputAreaString = useObservableValue(inputAreaString$);
  const outputAreaString = useObservableValue(outputAreaString$);

  return {
    inputAreaString,
    outputAreaString: outputAreaString ?? parseErrorMessage,
    setInputAreaString,
  };
};

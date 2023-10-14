import {
  evalSequence,
  parseLambdaTerm,
  termToString,
  type LambdaTerm,
} from '@noshiro/lambda-calculus-interpreter-core';
import {
  debounceTimeI,
  filter,
  map,
  mapI,
  withInitialValue,
  type InitializedObservable,
} from '@noshiro/syncflow';

export const useLambdaEval = (
  input$: InitializedObservable<string>,
): InitializedObservable<string> => {
  const inputBuffered$ = input$.chain(debounceTimeI(200 /* ms */));

  const parseTree$: InitializedObservable<LambdaTerm | undefined> =
    inputBuffered$.chain(mapI(parseLambdaTerm));

  const evalSequence$: InitializedObservable<LambdaTerm[]> = parseTree$
    .chain(filter(isNotUndefined))
    .chain(map(evalSequence))
    .chain(withInitialValue([]));

  const evalSeqToStr$: InitializedObservable<readonly string[]> =
    evalSequence$.chain(mapI((seq) => seq.map(termToString)));

  const output$: InitializedObservable<string> = evalSeqToStr$.chain(
    mapI((seq) => seq.map((s, i) => `${i}.\t${s}`).join('\n')),
  );

  return output$;
};

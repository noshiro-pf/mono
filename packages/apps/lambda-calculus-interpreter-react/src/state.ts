import {
  evalSequence,
  parseLambdaTerm,
  termToString,
} from '@noshiro/lambda-calculus-interpreter-core';

const { state$: inputAreaString$, setState: setInputAreaString } =
  createState<string>('((+ 2) 3)');

const outputAreaString$: InitializedObservable<string | undefined> =
  inputAreaString$.chain(debounceTimeI(200 /* ms */)).chain(
    mapI(
      (input) =>
        pipe(input)
          .chain(parseLambdaTerm)
          .chainOptional(evalSequence)
          .chainOptional((seq) => seq.map(termToString))
          .chainOptional((seq) => seq.map((s, i) => `${i}.\t${s}`).join('\n'))
          .value
    )
  );

export { inputAreaString$, setInputAreaString, outputAreaString$ };
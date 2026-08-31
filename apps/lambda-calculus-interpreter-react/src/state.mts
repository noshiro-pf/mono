import {
  evalSequence,
  parseLambdaTerm,
  termToString,
} from 'lambda-calculus-interpreter-core';
import {
  type InitializedObservable,
  createState,
  debounce,
  map,
} from 'synstate';
import { pipe } from 'ts-data-forge';

const [inputAreaString$, setInputAreaString] = createState<string>('((+ 2) 3)');

const outputAreaString$: InitializedObservable<string | undefined> =
  inputAreaString$.pipe(debounce(200 /* ms */)).pipe(
    map(
      (input) =>
        pipe(input)
          .map(parseLambdaTerm)
          .mapNullable(evalSequence)
          .mapNullable((seq) => seq.map(termToString))
          .mapNullable((seq) => seq.map((s, i) => `${i}.\t${s}`).join('\n'))
          .value,
    ),
  );

export { inputAreaString$, outputAreaString$, setInputAreaString };

import {
  evalSequence,
  LambdaTerm,
  parseLambdaTerm,
  termToString,
} from '@noshiro/lambda-calculus-interpreter-core';
import { useDataStream } from '@noshiro/preact-rxjs-utils';
import { isNotUndefined } from '@noshiro/ts-utils';
import { Observable } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
// import { splitToTokens } from '../parser/split-to-tokens';
// import { isLambdaTerm } from '../is-lambda-term';

export const useLambdaEval = (
  input$: Observable<string>
): Observable<string> => {
  const inputBuffered$ = useDataStream<string>('', () =>
    input$.pipe(debounceTime(200 /* ms */))
  );

  const parseTree$ = useDataStream<LambdaTerm | undefined>(undefined, () =>
    inputBuffered$.pipe(map(parseLambdaTerm))
  );

  // const parseTreeToStr$ = useDataStream<string>(
  //   '',
  //   parseTree$.pipe(map(termToString))
  // );

  const evalSequence$ = useDataStream<LambdaTerm[]>([], () =>
    parseTree$.pipe(filter(isNotUndefined), map(evalSequence))
  );

  const evalSeqToStr$ = useDataStream<string[]>([], () =>
    evalSequence$.pipe(map((seq) => seq.map(termToString)))
  );

  const output$ = useDataStream<string>('', () =>
    evalSeqToStr$.pipe(
      map((seq) => seq.map((s, i) => `${i}.\t${s}`).join('\n'))
    )
  );

  // const isLambdaTerm$ = useDataStream<boolean>(
  //   false,
  //   input$.pipe(
  //     map(splitToTokens),
  //     map(isLambdaTerm)
  //   )
  // );

  return output$;
};

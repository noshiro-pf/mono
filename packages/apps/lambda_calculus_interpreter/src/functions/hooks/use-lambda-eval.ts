import { useDataStream } from '@mono/react-rxjs-utils';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { evalSequence } from '../evaluator/eval-sequence';
import { parse } from '../parser/parse';
import { termToString } from '../print/term-to-string';
// import { splitToTokens } from '../parser/split-to-tokens';
// import { isLambdaTerm } from '../is-lambda-term';

export const useLambdaEval = (
  input$: Observable<string>
): Observable<string> => {
  const inputBuffered$ = useDataStream<string>(
    '',
    input$.pipe(debounceTime(200 /* ms */))
  );

  const parseTree$ = useDataStream<undefined | string | any[]>(
    undefined,
    inputBuffered$.pipe(map(parse))
  );

  // const parseTreeToStr$ = useDataStream<string>(
  //   '',
  //   parseTree$.pipe(map(termToString))
  // );

  const evalSequence$ = useDataStream<any[]>(
    [],
    parseTree$.pipe(map(evalSequence))
  );

  const evalSeqToStr$ = useDataStream<string[]>(
    [],
    evalSequence$.pipe(map((seq) => seq.map(termToString)))
  );

  const output$ = useDataStream<string>(
    '',
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

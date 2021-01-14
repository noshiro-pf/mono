import { isNotUndefined } from '@mono/ts-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { LambdaTerm } from '../types/lambda-term';
import { evalSequence } from './evaluator/eval-sequence';
import { parseLambdaTerm } from './parser/parse-lambda-term';
import { termToString } from './print/term-to-string';

export const toLambdaEvaluated: OperatorFunction<string, string> = (input$) => {
  const inputBuffered$ = input$.pipe(debounceTime(200 /* ms */));

  const parseTree$ = inputBuffered$.pipe(map(parseLambdaTerm));

  const evalSequence$: Observable<LambdaTerm[]> = parseTree$.pipe(
    filter(isNotUndefined),
    map(evalSequence)
  );

  const evalSeqToStr$: Observable<readonly string[]> = evalSequence$.pipe(
    map((seq) => seq.map(termToString))
  );

  const output$: Observable<string> = evalSeqToStr$.pipe(
    map((seq) => seq.map((s, i) => `${i}.\t${s}`).join('\n'))
  );

  return output$;
};

import { createState, map } from 'synstate';
import { constant, MatchResult, type JSX } from 'synstate-dom';
import { Result } from 'ts-data-forge';

const [parsed$] = createState<Result<number, string>>(Result.ok(0));

export const ParsedValue = (): JSX.Element => (
  <MatchResult
    value={parsed$}
    ok={(value$) => <output>{value$}</output>}
    err={(error$) => (
      <p role={constant('alert')}>{error$.pipe(map((e) => `Error: ${e}`))}</p>
    )}
  />
);

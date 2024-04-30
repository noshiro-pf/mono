import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertLibDom = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        'json(): Promise<unknown>;',
        'json(): Promise<JSONType>;',
      ),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Request extends Body {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice).chain(
            replaceWithNoMatchCheck(
              'readonly method: string;',
              'readonly method: HTTPRequestMethod;',
            ),
          ).value,
      }),
    )
    .chain(
      // https://developer.mozilla.org/ja/docs/Web/HTML/Element/form#method
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp:
          'interface XMLHttpRequest extends XMLHttpRequestEventTarget {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice).chain(
            replaceWithNoMatchCheck(
              'method: string',
              "method: 'post' | 'get' | 'dialog'",
            ),
          ).value,
      }),
    ).value;

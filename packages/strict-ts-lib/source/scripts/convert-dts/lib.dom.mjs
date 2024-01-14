import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibDom = (from) =>
  pipe(from)
    .chain(
      replaceWithNoMatchCheck(
        'json(): Promise<unknown>;',
        'json(): Promise<JSONType>;',
      ),
    )
    .chain((s) => {
      const slice = s.slice(
        s.indexOf('interface Request extends Body {'),
        s.indexOf('declare var Request: {'),
      );

      return replaceWithNoMatchCheck(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            'readonly method: string;',
            'readonly method: HTTPRequestMethod;',
          ),
        ).value,
      )(s);
    })
    .chain((s) => {
      const slice = s.slice(
        s.indexOf(
          'interface XMLHttpRequest extends XMLHttpRequestEventTarget {',
        ),
        s.indexOf('declare var XMLHttpRequest: {'),
      );

      // https://developer.mozilla.org/ja/docs/Web/HTML/Element/form#method
      return replaceWithNoMatchCheck(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            'method: string',
            "method: 'post' | 'get' | 'dialog'",
          ),
        ).value,
      )(s);
    }).value;

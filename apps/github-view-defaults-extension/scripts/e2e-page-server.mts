import * as http from 'node:http';
import { Num, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The server `configs/playwright.config.mts` starts, on the port it gives as
 * the one argument: one page, `/panes`, which frames a pull request's diff
 * beside its conversation as a split view's panes do, so that the e2e tests can
 * check the buttons in a frame without Split View itself. What the frames
 * show — `https://github.com/…` — is answered by the tests, never by GitHub.
 */
const panesPage = [
  '<!doctype html><html lang="en"><head><title>Panes</title></head><body>',
  '<iframe data-e2e="diff" title="diff" src="https://github.com/noshiro-pf/mono/pull/7/files" width="600" height="400"></iframe>',
  '<iframe data-e2e="conversation" title="conversation" src="https://github.com/noshiro-pf/mono/pull/7" width="600" height="400"></iframe>',
  '</body></html>',
].join('');

const server = http.createServer(
  (
    request: Readonly<{ url?: string }>,
    response: Readonly<{
      writeHead: (
        statusCode: number,
        headers: ReadonlyRecord<string, string>,
      ) => unknown;
      end: (body: string) => unknown;
    }>,
  ) => {
    const route = (request.url ?? '/').split('?', 1)[0] ?? '/';

    // `/` answers too, which is what Playwright waits on before the tests.
    if (route !== '/' && route !== '/panes') {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });

      response.end('not found');

      return;
    }

    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    });

    response.end(panesPage);
  },
);

const portArgument = process.argv[2] ?? '';

const port = Result.unwrapOkOr(Num.safeParseFloat(portArgument), Number.NaN);

if (!(Number.isSafeInteger(port) && 1 <= port && port <= 65_535)) {
  throw new TypeError(`Not a port: "${portArgument}"`);
}

// This machine only: the page is the tests' alone.
server.listen(port, 'localhost', () => {
  console.log(`e2e pages on http://localhost:${port.toString()}/`);
});

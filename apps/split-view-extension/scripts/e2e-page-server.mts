import * as http from 'node:http';
import { Num, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The server `configs/playwright.config.mts` starts, on the port it gives as
 * the one argument: the pages the e2e tests open in panes, so that the tests
 * need no network. Each page counts its visits, which is how a test sees a
 * reload: the pane looks the same before and after one.
 */
const pages: ReadonlyRecord<
  string,
  Readonly<{
    title: string;
    body: string;
    headers?: ReadonlyRecord<string, string>;
  }>
> = {
  '/': {
    title: 'E2E Home',
    body: '<h1>home</h1><a href="/second">to the second page</a>',
  },
  '/second': {
    title: 'E2E Second',
    body: '<h1>second</h1><a href="/">back home</a>',
  },
  '/refuses-framing': {
    title: 'Refuses Framing',
    body: '<h1>framed anyway</h1>',
    headers: {
      'x-frame-options': 'DENY',
      'content-security-policy': "frame-ancestors 'none'",
    },
  },
} as const;

const mut_visits = new Map<string, number>();

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

    const page = pages[route];

    if (page === undefined) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });

      response.end('not found');

      return;
    }

    const visits = (mut_visits.get(route) ?? 0) + 1;

    mut_visits.set(route, visits);

    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      ...page.headers,
    });

    response.end(
      [
        `<!doctype html><html lang="en"><head><title>${page.title}</title></head><body>`,
        page.body,
        `<p>visit ${visits.toString()}</p>`,
        '</body></html>',
      ].join(''),
    );
  },
);

const portArgument = process.argv[2] ?? '';

const port = Result.unwrapOkOr(Num.safeParseFloat(portArgument), Number.NaN);

if (!(Number.isSafeInteger(port) && 1 <= port && port <= 65_535)) {
  throw new TypeError(`Not a port: "${portArgument}"`);
}

// This machine only: the pages are the tests' alone.
server.listen(port, 'localhost', () => {
  console.log(`e2e pages on http://localhost:${port.toString()}/`);
});

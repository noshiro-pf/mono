import * as http from 'node:http';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';

/**
 * The pages the e2e tests and the screenshots open in panes, so that neither
 * needs the network. On port 0, read back once listening (spec D3): nothing
 * fixed can collide with another server.
 *
 * Each page counts its visits, which is how a test sees a reload: the pane
 * looks the same before and after one. `/request-headers` writes back the Fetch
 * Metadata the request arrived with, which is how a test sees the framing rule
 * rewrite them.
 */
export const startPageServer = async (): Promise<PageServer> => {
  const mut_visits = new Map<string, number>();

  const server = http.createServer((request, response) => {
    const route = (request.url ?? '/').split('?', 1)[0] ?? '/';

    const page =
      route === '/request-headers'
        ? headersPage(request.headers)
        : route.startsWith(demoPrefix)
          ? demoPage(escapeHtml(route.slice(demoPrefix.length)))
          : pages.get(route);

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
        // Not on a demo page, where it would be in the picture.
        route.startsWith(demoPrefix) ? '' : `<p>visit ${visits.toString()}</p>`,
        '</body></html>',
      ].join(''),
    );
  });

  // This machine only: the pages are the tests' alone.
  await new Promise<void>((resolve) => {
    server.listen(0, 'localhost', resolve);
  });

  const address = server.address();

  // A string is a pipe or socket path, which `listen(0, …)` never gives.
  if (address === null || typeof address === 'string') {
    throw new Error('The page server is not listening on a port');
  }

  return {
    origin: `http://localhost:${address.port.toString()}`,
    close: async () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error === undefined) {
            resolve();
          } else {
            reject(error);
          }
        });
      }),
  };
};

export type PageServer = Readonly<{
  /** `http://localhost:<port>`, no trailing slash. */
  origin: string;
  close: () => Promise<void>;
}>;

type Page = Readonly<{
  title: string;
  body: string;
  headers?: ReadonlyRecord<string, string>;
}>;

const pages = new Map<string, Page>([
  [
    '/',
    {
      title: 'E2E Home',
      body: '<h1>home</h1><a href="/second">to the second page</a>',
    },
  ],
  [
    '/second',
    {
      title: 'E2E Second',
      body: '<h1>second</h1><a href="/">back home</a>',
    },
  ],
  [
    '/refuses-framing',
    {
      title: 'Refuses Framing',
      body: '<h1>framed anyway</h1>',
      headers: {
        'x-frame-options': 'DENY',
        'content-security-policy': "frame-ancestors 'none'",
      },
    },
  ],
]);

/**
 * `/demo/<name>`: a plain page that looks like something one reads, for the
 * screenshots, so that they show the split view rather than somebody else's
 * site and go on looking the same.
 */
const demoPrefix = '/demo/';

const demoPage = (name: string): Page =>
  ({
    title: name,
    body: [
      '<style>',
      'body{font:16px/1.7 system-ui,sans-serif;margin:0;padding:24px;color:#1f2126}',
      'h1{font-size:22px;margin:0 0 4px}',
      'p{max-width:60ch;color:#4a5160}',
      '.row{border-top:1px solid #e6e8ec;padding:10px 0;display:flex;gap:12px}',
      '.tag{background:#eef2fb;color:#4f7fd9;border-radius:4px;padding:1px 8px;font-size:13px}',
      '</style>',
      `<h1>${name}</h1>`,
      '<p>A page served by the page server, so that what the picture shows is the split view.</p>',
      ...Array.from(
        { length: 6 },
        (_, index) =>
          `<div class="row"><span class="tag">${name}</span><span>Line ${(index + 1).toString()} of something you might be reading in a pane</span></div>`,
      ),
    ].join(''),
  }) as const;

/** What a request brings is text on these pages, never markup. */
const escapeHtml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const headerText = (value: string | undefined | readonly string[]): string =>
  escapeHtml(
    value === undefined
      ? ''
      : typeof value === 'string'
        ? value
        : value.join(', '),
  );

const headersPage = (headers: DeepReadonly<http.IncomingHttpHeaders>): Page =>
  ({
    title: 'Request Headers',
    body: ['sec-fetch-dest', 'sec-fetch-mode', 'sec-fetch-site']
      .map(
        (name) =>
          `<p data-header="${name}">${name}: ${headerText(headers[name])}</p>`,
      )
      .join(''),
  }) as const;

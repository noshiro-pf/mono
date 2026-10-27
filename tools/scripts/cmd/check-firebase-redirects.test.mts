import {
  findRedirectViolations,
  redirectConfig,
} from './check-firebase-redirects.mjs';

const PAGES_URL = 'https://noshiro-pf.github.io/mono/catan-dice/';

const app = (
  files: Readonly<{ firebaseJson?: unknown; firebaserc?: boolean }>,
): Parameters<typeof findRedirectViolations>[0][number] =>
  ({
    packageDir: 'catan-dice',
    pagesUrl: PAGES_URL,
    firebaseJson:
      files.firebaseJson === undefined
        ? undefined
        : JSON.stringify(files.firebaseJson),
    hasFirebaserc: files.firebaserc ?? false,
  }) as const;

describe(redirectConfig, () => {
  test('sends every path, kept, to the same path below the Pages URL', () => {
    assert.deepStrictEqual(redirectConfig(PAGES_URL), {
      hosting: {
        public: 'public',
        redirects: [
          {
            regex: '^/(.*)$',
            destination: `${PAGES_URL}:1`,
            type: 301,
          },
        ],
      },
    });
  });
});

describe(findRedirectViolations, () => {
  test('accepts an app whose Firebase project is gone', () => {
    assert.deepStrictEqual(findRedirectViolations([app({})]), []);
  });

  test('accepts the redirect with its .firebaserc', () => {
    assert.deepStrictEqual(
      findRedirectViolations([
        app({ firebaseJson: redirectConfig(PAGES_URL), firebaserc: true }),
      ]),
      [],
    );
  });

  test('accepts a Firebase backend that hosts nothing', () => {
    assert.deepStrictEqual(
      findRedirectViolations([
        app({
          firebaseJson: { firestore: { rules: 'firestore.rules' } },
          firebaserc: true,
        }),
      ]),
      [],
    );
  });

  test('accepts the redirect beside a Firebase backend', () => {
    assert.deepStrictEqual(
      findRedirectViolations([
        app({
          firebaseJson: {
            ...redirectConfig(PAGES_URL),
            firestore: { rules: 'firestore.rules' },
          },
          firebaserc: true,
        }),
      ]),
      [],
    );
  });

  test('reports a firebase.json left without its .firebaserc', () => {
    assert.strictEqual(
      findRedirectViolations([app({ firebaseJson: redirectConfig(PAGES_URL) })])
        .length,
      1,
    );
  });

  test('reports a .firebaserc left without its firebase.json', () => {
    assert.strictEqual(
      findRedirectViolations([app({ firebaserc: true })]).length,
      1,
    );
  });

  test('reports a firebase.json that serves the app instead', () => {
    assert.strictEqual(
      findRedirectViolations([
        app({
          firebaseJson: { hosting: { public: 'build' } },
          firebaserc: true,
        }),
      ]).length,
      1,
    );
  });

  test('reports a redirect to another directory', () => {
    assert.strictEqual(
      findRedirectViolations([
        app({
          firebaseJson: redirectConfig(
            'https://noshiro-pf.github.io/mono/catan/',
          ),
          firebaserc: true,
        }),
      ]).length,
      1,
    );
  });
});

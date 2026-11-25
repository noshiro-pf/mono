import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noUnreturnedPromiseInCloudFunction } from './no-unreturned-promise-in-cloud-function.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

const unreturnedPromise = 'unreturnedPromise';

/**
 * The handlers' registrars, from a stand-in for `firebase-functions` whose
 * module is ambient (`test/firebase-functions.d.ts`), and what they call.
 */
const prelude = dedent`
  /// <reference path="./test/firebase-functions.d.ts" />
  import * as functions from 'firebase-functions';
  declare const run: () => Promise<void>;
  declare const other: () => Promise<number>;
  declare const log: (error: unknown) => void;
`;

describe('no-unreturned-promise-in-cloud-function', () => {
  tester.run(
    'no-unreturned-promise-in-cloud-function',
    noUnreturnedPromiseInCloudFunction,
    {
      valid: [
        {
          name: 'a handler that returns or awaits its promise',
          code: dedent`
            ${prelude}
            functions.https.onCall(() => run());
            functions.https.onCall(() => run().catch(log));
            functions.https.onCall(() => {
              return run().catch(log);
            });
            functions.https.onCall(async () => {
              await run();
            });
          `,
        },
        {
          name: 'a statement that is not a promise',
          code: dedent`
            ${prelude}
            functions.https.onCall(() => {
              log('x');
              return 1;
            });
          `,
        },
        {
          name: 'a promise in a function nested in the handler, which is not the handler',
          code: dedent`
            ${prelude}
            functions.https.onCall(() => {
              const later = () => {
                run();
              };

              return later;
            });
          `,
        },
        {
          name: 'a registrar of another module',
          code: dedent`
            ${prelude}
            declare const elsewhere: {
              onCall: (handler: () => unknown) => unknown;
            };
            elsewhere.onCall(() => {
              run().catch(log);
            });
          `,
        },
        {
          name: 'a value that is no function passed to a function of the package, such as a caught error or a parameter',
          code: dedent`
            ${prelude}
            const report = (message: string) => {
              try {
                log(message);
              } catch (error) {
                functions.logger.error(message, error);
              }
            };
          `,
        },
        {
          name: 'a floating promise outside any handler, which other rules judge',
          code: dedent`
            ${prelude}
            run().catch(log);
          `,
        },
      ],
      invalid: [
        {
          name: 'a promise ended with `.catch`, and one discarded with `void`',
          code: dedent`
            ${prelude}
            functions.auth.user().onDelete((user) => {
              run().catch(log);
            });
            functions.https.onCall(() => {
              void run();
            });
          `,
          errors: [
            { messageId: unreturnedPromise },
            { messageId: unreturnedPromise },
          ],
        },
        {
          name: 'one promise returned and another left behind',
          code: dedent`
            ${prelude}
            functions.pubsub.schedule('* * * * *').onRun(async () => {
              run();

              return other();
            });
          `,
          errors: [{ messageId: unreturnedPromise, line: 7 }],
        },
        {
          name: 'a statement in a block of the handler',
          code: dedent`
            ${prelude}
            functions.https.onCall((data) => {
              if (data === 1) {
                run();
              }

              try {
                other();
              } finally {
                log(data);
              }
            });
          `,
          errors: [
            { messageId: unreturnedPromise },
            { messageId: unreturnedPromise },
          ],
        },
        {
          name: 'a handler passed by reference, an arrow or a function declaration',
          code: dedent`
            ${prelude}
            const onCallHandler = () => {
              run();
            };
            function onRunHandler() {
              run();
            }
            functions.https.onCall(onCallHandler);
            functions.pubsub.schedule('* * * * *').onRun(onRunHandler);
          `,
          errors: [
            { messageId: unreturnedPromise },
            { messageId: unreturnedPromise },
          ],
        },
        {
          name: 'stacked type wrappers around the handler',
          code: dedent`
            ${prelude}
            type Handler = (data: unknown) => unknown;
            functions.https.onCall((() => {
              run();
            }) satisfies Handler);
            functions.https.onCall((() => {
              run();
            }) as unknown as Handler);
            functions.https.onCall(<Handler>(() => {
              run();
            }));
          `,
          errors: [
            { messageId: unreturnedPromise },
            { messageId: unreturnedPromise },
            { messageId: unreturnedPromise },
          ],
        },
        {
          name: 'a handler built by a helper, from its argument or what it returns',
          code: dedent`
            ${prelude}
            declare const withAuth: <F>(handler: F) => F;
            const makeHandler = () => () => {
              run();
            };
            functions.https.onCall(withAuth(() => {
              run();
            }));
            functions.https.onCall(makeHandler());
          `,
          errors: [
            { messageId: unreturnedPromise },
            { messageId: unreturnedPromise },
          ],
        },
        {
          name: 'a promise that may be undefined',
          code: dedent`
            ${prelude}
            declare const maybe: Promise<void> | undefined;
            functions.https.onCall(() => {
              maybe?.catch(log);
            });
          `,
          errors: [{ messageId: unreturnedPromise }],
        },
      ],
    },
  );
});

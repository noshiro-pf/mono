import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { requireImeGuardOnEnter } from './require-ime-guard-on-enter.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

// The package is type-checked without the DOM library, so each case declares
// the event it reads, after its code so that the reported lines stay put.
const keyboardEvent = dedent`
  type KeyboardEvent = Readonly<{
    key: string;
    keyCode: number;
    isComposing: boolean;
  }>;
`;

const reactKeyboardEvent = dedent`
  type ReactKeyboardEvent = Readonly<{
    key: string;
    nativeEvent: KeyboardEvent;
  }>;
`;

describe('require-ime-guard-on-enter', () => {
  tester.run('require-ime-guard-on-enter', requireImeGuardOnEnter, {
    valid: [
      {
        name: 'an isComposing check in the same condition',
        code: dedent`
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !event.isComposing) {
              submit();
            }
          };
          declare const submit: () => void;
          ${keyboardEvent}
        `,
      },
      {
        name: 'an early return on the guard function',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (isImeKeyDown(event)) {
              return;
            }

            switch (event.key) {
              case 'Enter':
                submit();
                break;
              default:
                break;
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'the guard function called as a method',
        code: dedent`
          declare const keys: Readonly<{
            isImeKeyDown: (event: KeyboardEvent) => boolean;
          }>;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !keys.isImeKeyDown(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a guard in an enclosing function on the same event',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const items: readonly string[];
          const onKeyDown = (event: KeyboardEvent): void => {
            if (isImeKeyDown(event)) {
              return;
            }

            for (const item of items) {
              [item].forEach(() => {
                if (event.key === 'Enter') {
                  console.log(item);
                }
              });
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a React event guarded through nativeEvent',
        code: dedent`
          ${reactKeyboardEvent}
          declare const submit: () => void;
          const onKeyDown = (event: ReactKeyboardEvent): void => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a guard function named by the option',
        code: dedent`
          declare const isComposingEnter: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !isComposingEnter(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        options: [{ guardFunctions: ['isComposingEnter'] }],
      },
      {
        name: 'an operator other than a comparison',
        code: dedent`
          declare const event: KeyboardEvent;
          const label = event.key + 'Enter';
          ${keyboardEvent}
        `,
      },
      {
        name: 'a React event whose nativeEvent key is read, guarded on the event',
        code: dedent`
          ${reactKeyboardEvent}
          declare const isImeKeyDown: (event: ReactKeyboardEvent) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: ReactKeyboardEvent): void => {
            if (isImeKeyDown(event)) {
              return;
            }

            if (event.nativeEvent.key === 'Enter') {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a key other than Enter',
        code: dedent`
          declare const close: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
              close();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a key property of something that is not an event',
        code: dedent`
          declare const entry: Readonly<{ key: string; value: number }>;
          const isEnter = entry.key === 'Enter';
          ${keyboardEvent}
        `,
      },
      {
        name: 'an event typed any',
        code: dedent`
          declare const event: any;
          const isEnter = event.key === 'Enter';
          ${keyboardEvent}
        `,
      },
      {
        name: 'a guard through type wrappers',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if ((event satisfies KeyboardEvent).key === 'Enter' && !isImeKeyDown(event!)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
    ],
    invalid: [
      {
        name: 'a comparison with no guard',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter') {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 3 }],
      },
      {
        name: 'a negated comparison with no guard',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key !== 'Enter') {
              return;
            }

            submit();
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 3 }],
      },
      {
        name: 'the literal on the left',
        code: dedent`
          declare const event: KeyboardEvent;
          const isEnter = 'Enter' === event.key;
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'a computed key access',
        code: dedent`
          declare const event: KeyboardEvent;
          const isEnter = event['key'] === 'Enter';
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'an optional chain',
        code: dedent`
          declare const event: KeyboardEvent | undefined;
          const isEnter = event?.key === 'Enter';
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'an event that is not a variable',
        code: dedent`
          declare const lastEvent: () => KeyboardEvent;
          const isEnter = lastEvent().key === 'Enter' && !lastEvent().isComposing;
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'a code comparison with no guard',
        code: dedent`
          declare const event: KeyboardEvent & Readonly<{ code: string }>;
          const isEnter = event.code === 'Enter';
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'the numeric keypad Enter by code',
        code: dedent`
          declare const event: KeyboardEvent & Readonly<{ code: string }>;
          const isEnter = event.code === 'NumpadEnter';
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'a template literal with no substitutions',
        code: dedent`
          declare const event: KeyboardEvent;
          const isEnter = event.key === \`Enter\`;
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'an event typed as a union of a DOM and a React event',
        code: dedent`
          ${reactKeyboardEvent}
          declare const event: KeyboardEvent | ReactKeyboardEvent;
          const isEnter = event.key === 'Enter';
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 6 }],
      },
      {
        name: 'a guard on a nested parameter that shadows the event',
        code: dedent`
          declare const submit: () => void;
          declare const listen: (handler: (event: KeyboardEvent) => void) => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter') {
              submit();
            }

            listen((event) => {
              if (event.isComposing) {
                submit();
              }
            });
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 4 }],
      },
      {
        name: 'a switch case with no guard',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            switch (event.key) {
              case 'Enter':
                submit();
                break;
              default:
                break;
            }
          };
          ${keyboardEvent}
        `,
        errors: [
          // The label alone, not the case's body.
          { messageId: 'missingImeGuard', line: 4, endLine: 4 },
        ],
      },
      {
        name: 'a React event with no guard',
        code: dedent`
          ${reactKeyboardEvent}
          declare const submit: () => void;
          const onKeyDown = (event: ReactKeyboardEvent): void => {
            if (event.key === 'Enter') {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 7 }],
      },
      {
        name: 'a guard on another event',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const other: KeyboardEvent;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !isImeKeyDown(other)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 5 }],
      },
      {
        name: 'a guard in another handler whose event has the same name',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const handlers = {
            first: (event: KeyboardEvent): void => {
              if (event.key === 'Escape' && !isImeKeyDown(event)) {
                submit();
              }
            },
            second: (event: KeyboardEvent): void => {
              if (event.key === 'Enter') {
                submit();
              }
            },
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 10 }],
      },
      {
        name: 'a guard function the option does not name',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !isImeKeyDown(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        options: [{ guardFunctions: ['isComposingEnter'] }],
        errors: [{ messageId: 'missingImeGuard', line: 4 }],
      },
    ],
  });
});

describe('require-ime-guard-on-enter through type wrappers', () => {
  tester.run('require-ime-guard-on-enter', requireImeGuardOnEnter, {
    valid: [
      {
        name: 'the guard argument wrapped',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const event: KeyboardEvent;
          const isEnter = event.key === 'Enter' && !isImeKeyDown(event as KeyboardEvent);
          ${keyboardEvent}
        `,
      },
      {
        name: 'the isComposing object wrapped',
        code: dedent`
          declare const event: KeyboardEvent;
          const isEnter = event.key === 'Enter' && !(event satisfies KeyboardEvent).isComposing;
          ${keyboardEvent}
        `,
      },
    ],
    invalid: [
      {
        name: 'the literal wrapped in satisfies',
        code: dedent`
          declare const event: KeyboardEvent;
          const isEnter = event.key === ('Enter' satisfies string);
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'the key read wrapped in as',
        code: dedent`
          declare const event: KeyboardEvent;
          const isEnter = (event.key as string) === 'Enter';
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'the event wrapped in a non-null assertion',
        code: dedent`
          declare const event: KeyboardEvent | undefined;
          const isEnter = event!.key === 'Enter';
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'the event cast from unknown',
        code: dedent`
          declare const event: unknown;
          const isEnter = (event as KeyboardEvent).key === 'Enter';
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'the whole comparison wrapped and parenthesized',
        code: dedent`
          declare const event: KeyboardEvent;
          const isEnter = ((event.key === 'Enter') satisfies boolean);
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 2 }],
      },
      {
        name: 'the switch case wrapped',
        code: dedent`
          declare const event: KeyboardEvent;
          switch (event.key as string) {
            case 'Enter' as string:
              break;
            default:
              break;
          }
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 3 }],
      },
    ],
  });
});

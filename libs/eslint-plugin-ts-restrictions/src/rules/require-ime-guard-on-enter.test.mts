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
      tsconfigRootDir: `${import.meta.dirname}/../..`,
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
        name: 'a key other than Enter or Escape',
        code: dedent`
          declare const close: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Tab') {
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

describe('require-ime-guard-on-enter through locals and collections', () => {
  tester.run('require-ime-guard-on-enter', requireImeGuardOnEnter, {
    valid: [
      {
        name: 'a key read into a local, guarded',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            const key = event.key;

            if (key === 'Enter' && !isImeKeyDown(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a collection test, guarded',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (['Enter', ' '].includes(event.key) && !isImeKeyDown(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a collection that holds neither Enter nor Escape',
        code: dedent`
          declare const submit: () => void;
          const arrowKeys = new Set(['ArrowUp', 'ArrowDown']);
          const onKeyDown = (event: KeyboardEvent): void => {
            if (arrowKeys.has(event.key)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a local that is not a const',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            let key = event.key;
            key = 'x';

            if (key === 'Enter') {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a key read from an aliased nativeEvent, guarded on the original',
        code: dedent`
          ${reactKeyboardEvent}
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const close: () => void;
          const onKeyDown = (event: ReactKeyboardEvent): void => {
            const native = event.nativeEvent;
            const key = native.key;

            if (isImeKeyDown(event.nativeEvent)) {
              return;
            }

            if (key === 'Escape') {
              close();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a guard on an alias of the event',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            const aliased = event;

            if (isImeKeyDown(aliased)) {
              return;
            }

            if (event.key === 'Enter') {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a key and a guard on a const bound to a call',
        code: dedent`
          declare const lastEvent: () => KeyboardEvent;
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          const event = lastEvent();
          const isEnter = event.key === 'Enter' && !isImeKeyDown(event);
          ${keyboardEvent}
        `,
      },
      {
        name: 'has on a Set class the file declares',
        code: dedent`
          class Set {
            constructor(readonly items: readonly string[]) {}
            has(_value: string): boolean {
              return false;
            }
          }
          declare const submit: () => void;
          const KEYS = new Set(['Enter']);
          const onKeyDown = (event: KeyboardEvent): void => {
            if (KEYS.has(event.key)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'an aliased nativeEvent through type wrappers',
        code: dedent`
          ${reactKeyboardEvent}
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const close: () => void;
          const onKeyDown = (event: ReactKeyboardEvent | undefined): void => {
            const native = event!.nativeEvent as KeyboardEvent;
            const key = (native satisfies KeyboardEvent).key;

            if (isImeKeyDown(event!.nativeEvent)) {
              return;
            }

            if (key === 'Escape') {
              close();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'an alias of a call result, guarded through the alias',
        code: dedent`
          ${reactKeyboardEvent}
          declare const getEvent: () => ReactKeyboardEvent;
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const ev = getEvent().nativeEvent;
          if (!isImeKeyDown(ev) && ev.key === 'Enter') {
            submit();
          }
          ${keyboardEvent}
        `,
      },
      {
        name: 'a key read through a parenthesized optional chain',
        code: dedent`
          ${reactKeyboardEvent}
          declare const isImeKeyDown: (event: KeyboardEvent | undefined) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: ReactKeyboardEvent | undefined): void => {
            if ((event?.nativeEvent)!.key === 'Enter' && !isImeKeyDown(event?.nativeEvent)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'isComposing read by a template literal or a wrapped literal',
        code: dedent`
          declare const event: KeyboardEvent;
          const isEnter = event.key === 'Enter' && !event[\`isComposing\`];
          const isEscape = event.key === 'Escape' && !event['isComposing' as const];
          ${keyboardEvent}
        `,
      },
      {
        name: 'a local guard that shadows another export imported under its name',
        code: dedent`
          import { other as isImeKeyDown } from 'elsewhere';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            const isImeKeyDown = (_: KeyboardEvent): boolean => false;

            if (event.key === 'Enter' && !isImeKeyDown(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'has on an imported Set',
        code: dedent`
          import { Set } from 'immutable';
          declare const submit: () => void;
          const KEYS = new Set(['Enter']);
          const onKeyDown = (event: KeyboardEvent): void => {
            if (KEYS.has(event.key)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a key read inside a logical expression, not seen',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent | undefined): void => {
            if ((event?.key ?? '') === 'Enter') {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
    ],
    invalid: [
      {
        name: 'a guard on an alias of another event',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const other: KeyboardEvent;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            const aliased = other;

            if (isImeKeyDown(aliased)) {
              return;
            }

            if (event.key === 'Enter') {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 11 }],
      },
      {
        name: 'has on a Set beside a type of that name',
        code: dedent`
          type Set = never;
          declare const submit: () => void;
          const LOCAL_KEYS = new Set(['Enter']);
          const onKeyDown = (event: KeyboardEvent): void => {
            if (LOCAL_KEYS.has(event.key)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 5 }],
      },
      {
        name: 'has on a Set whose constructor is wrapped',
        code: dedent`
          declare const submit: () => void;
          const KEYS = new (Set as SetConstructor)(['Enter']);
          const onKeyDown = (event: KeyboardEvent): void => {
            if (KEYS.has(event.key)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 4 }],
      },
      {
        name: 'a key read into a local',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            const key = event.key;

            if (key === 'Enter') {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 5 }],
      },
      {
        name: 'a key read into a local and switched on',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            const key = event.key as string;

            switch (key) {
              case 'Enter':
                submit();
                break;
              default:
                break;
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 6 }],
      },
      {
        name: 'includes on a literal array',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (['Enter', ' '].includes(event.key)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 3 }],
      },
      {
        name: 'has on a Set bound to a const',
        code: dedent`
          declare const remove: () => void;
          const DELETE_KEYS = new Set(['Delete', 'Backspace', 'Enter']);
          const onKeyDown = (pressed: KeyboardEvent): void => {
            if (DELETE_KEYS.has(pressed.key)) {
              remove();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 4 }],
      },
      {
        name: 'includes on an array bound to a const as const',
        code: dedent`
          declare const submit: () => void;
          const SUBMIT_KEYS = ['Enter', 'NumpadEnter'] as const;
          const onKeyDown = (event: KeyboardEvent): void => {
            if ((SUBMIT_KEYS as readonly string[]).includes(event.key)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 4 }],
      },
      {
        name: 'a local key tested by a collection',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            const { key: _unused } = event;
            const pressed = event.key;

            if (['Enter'].includes(pressed)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 6 }],
      },
    ],
  });
});

describe('require-ime-guard-on-enter with imported guards', () => {
  tester.run('require-ime-guard-on-enter', requireImeGuardOnEnter, {
    valid: [
      {
        name: 'an aliased import of the guard',
        code: dedent`
          import { isImeKeyDown as imeKey } from 'synstate-dom';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !imeKey(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a guard function option naming the export of an aliased import',
        code: dedent`
          import { isComposingEnter as ce } from 'x';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !ce(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        options: [{ guardFunctions: ['isComposingEnter'] }],
      },
      {
        name: 'an aliased guard through a type wrapper',
        code: dedent`
          import { isImeKeyDown as imeKey } from 'synstate-dom';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !(imeKey as typeof imeKey)(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a namespace guard through a type wrapper',
        code: dedent`
          import * as dom from 'synstate-dom';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !(dom satisfies typeof dom).isImeKeyDown(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'the guard through a namespace import',
        code: dedent`
          import * as dom from 'synstate-dom';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !dom.isImeKeyDown(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a guard argument written as an optional chain',
        code: dedent`
          ${reactKeyboardEvent}
          declare const isImeKeyDown: (event: KeyboardEvent | undefined) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: ReactKeyboardEvent | undefined): void => {
            if (event?.key === 'Enter' && !isImeKeyDown(event?.nativeEvent)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a default import named as a guard',
        code: dedent`
          import isImeKeyDown from './ime.mjs';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !isImeKeyDown(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'a guard argument written as an optional chain in a type wrapper',
        code: dedent`
          ${reactKeyboardEvent}
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          const onKeyDown = (event: ReactKeyboardEvent | undefined): void => {
            if (event?.key === 'Enter' && !isImeKeyDown(event?.nativeEvent as KeyboardEvent)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'the guard called through a computed member',
        code: dedent`
          declare const keys: Readonly<{
            isImeKeyDown: (event: KeyboardEvent) => boolean;
          }>;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !keys['isImeKeyDown'](event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
      },
    ],
    invalid: [
      {
        name: 'another export imported under the guard name',
        code: dedent`
          import { isComposingSomething as isImeKeyDown } from 'elsewhere';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !isImeKeyDown(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 4 }],
      },
      {
        name: 'an alias of a chain on this, guarded in another class',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const submit: () => void;
          class A {
            constructor(readonly ev: KeyboardEvent) {}
            handle(): void {
              const native = this.ev;

              if (native.key === 'Enter') {
                submit();
              }
            }
          }
          class B {
            constructor(readonly ev: KeyboardEvent) {}
            handle(): boolean {
              return isImeKeyDown(this.ev);
            }
          }
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 8 }],
      },
      {
        name: 'a guard function option naming a local alias',
        code: dedent`
          import { isImeKeyDown as imeKey } from 'synstate-dom';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !imeKey(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        options: [{ guardFunctions: ['imeKey'] }],
        errors: [{ messageId: 'missingImeGuard', line: 4 }],
      },
      {
        name: 'a default import whose local name is not a guard',
        code: dedent`
          import imeKey from './ime.mjs';
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !imeKey(event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 4 }],
      },
      {
        name: 'a computed member call of another name',
        code: dedent`
          declare const keys: Readonly<{
            other: (event: KeyboardEvent) => boolean;
          }>;
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' && !keys['other'](event)) {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 6 }],
      },
    ],
  });
});

describe('require-ime-guard-on-enter on Escape', () => {
  tester.run('require-ime-guard-on-enter', requireImeGuardOnEnter, {
    valid: [
      {
        name: 'an Escape comparison, guarded',
        code: dedent`
          declare const isImeKeyDown: (event: KeyboardEvent) => boolean;
          declare const close: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape' && !isImeKeyDown(event)) {
              close();
            }
          };
          ${keyboardEvent}
        `,
      },
      {
        name: 'an Escape comparison when the option leaves Escape out',
        code: dedent`
          declare const close: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
              close();
            }
          };
          ${keyboardEvent}
        `,
        options: [{ keys: ['Enter'] }],
      },
      {
        name: 'an Enter comparison when the option leaves Enter out',
        code: dedent`
          declare const submit: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter') {
              submit();
            }
          };
          ${keyboardEvent}
        `,
        options: [{ keys: ['Escape'] }],
      },
    ],
    invalid: [
      {
        name: 'an Escape comparison with no guard',
        code: dedent`
          declare const close: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
              close();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuardOnEscape', line: 3 }],
      },
      {
        name: 'an Escape case with no guard',
        code: dedent`
          declare const close: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            switch (event.key) {
              case 'Escape':
                close();
                break;
              default:
                break;
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuardOnEscape', line: 4 }],
      },
      {
        name: 'a collection holding Escape alone',
        code: dedent`
          declare const close: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (['Escape', 'Esc'].includes(event.key)) {
              close();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuardOnEscape', line: 3 }],
      },
      {
        name: 'a collection holding both reported once, as Enter',
        code: dedent`
          declare const close: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (['Escape', 'Enter'].includes(event.key)) {
              close();
            }
          };
          ${keyboardEvent}
        `,
        errors: [{ messageId: 'missingImeGuard', line: 3 }],
      },
      {
        name: 'a collection holding both, with the option leaving Enter out',
        code: dedent`
          declare const close: () => void;
          const onKeyDown = (event: KeyboardEvent): void => {
            if (['Escape', 'Enter'].includes(event.key)) {
              close();
            }
          };
          ${keyboardEvent}
        `,
        options: [{ keys: ['Escape'] }],
        errors: [{ messageId: 'missingImeGuardOnEscape', line: 3 }],
      },
    ],
  });
});

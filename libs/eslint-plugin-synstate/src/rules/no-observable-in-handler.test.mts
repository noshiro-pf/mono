import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noObservableInHandler } from './no-observable-in-handler.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const tsx = 'component.tsx';

ruleTester.run('no-observable-in-handler', noObservableInHandler, {
  valid: [
    {
      name: 'a handler that writes to a state',
      filename: tsx,
      code: dedent`
        import { createState } from 'synstate';
        const [count$, setCount] = createState(0);
        const Counter = () => <button onClick={() => { setCount((n) => n + 1); }} />;
      `,
    },
    {
      name: 'an observable derived at mount time, outside the handler',
      filename: tsx,
      code: dedent`
        import { map } from 'synstate';
        const Row = () => {
          const doubled$ = count$.pipe(map((n) => n * 2));
          return <button onClick={() => { log(doubled$); }} />;
        };
      `,
    },
    {
      name: 'work wrapped in the run of a scope taken at mount time',
      filename: tsx,
      code: dedent`
        import { getCurrentScope, map } from 'synstate';
        const Row = () => {
          const scope = getCurrentScope();
          return (
            <button
              onClick={async () => {
                await save();
                scope?.run(() => {
                  keep(count$.pipe(map((n) => n * 2)));
                });
              }}
            />
          );
        };
      `,
    },
    {
      name: 'an observable made under `untracked`, which belongs to no scope on purpose',
      filename: tsx,
      code: dedent`
        import { derive, untracked } from 'synstate';
        const Row = () => (
          <button onClick={() => { keep(untracked(() => derive([a$, b$], (a, b) => a + b))); }} />
        );
      `,
    },
    {
      name: 'a root state, which computes nothing and is collected once unreferenced',
      filename: tsx,
      code: dedent`
        import { createState, just } from 'synstate';
        const Row = () => <button onClick={() => { keep(createState(0), just(1)); }} />;
      `,
    },
    {
      name: 'a `.pipe` whose operators are not synstate’s',
      filename: tsx,
      code: dedent`
        import { map } from 'rxjs';
        const Row = () => <button onClick={() => { keep(a$.pipe(map((n) => n * 2))); }} />;
      `,
    },
    {
      name: 'a local binding that shadows the import',
      filename: tsx,
      code: dedent`
        import { combine } from 'synstate';
        const Row = () => (
          <button onClick={() => { const combine = (xs) => xs; keep(combine([1, 2])); }} />
        );
      `,
    },
    {
      name: 'an attribute that only starts like a handler',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        const Row = () => <Panel once={() => derive([a$], (a) => a)} />;
      `,
    },
    {
      name: 'a function of the file that no handler names',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        const total = () => derive([a$, b$], (a, b) => a + b);
        const Row = () => <button onClick={() => { log(1); }} />;
      `,
    },
    {
      name: 'an event listener’s scope wrapped in run',
      code: dedent`
        import { getCurrentScope, map } from 'synstate';
        const scope = getCurrentScope();
        window.addEventListener('resize', () => {
          scope?.run(() => keep(width$.pipe(map((w) => w / 2))));
        });
      `,
    },
    {
      name: 'a timer, and a counter that stops by itself',
      filename: tsx,
      code: dedent`
        import { counter, timer } from 'synstate';
        const Row = () => (
          <button
            onClick={() => {
              timer(300).subscribe(() => { setFlash(false); });
              counter(100, { times: 3 }).subscribe(tick);
            }}
          />
        );
      `,
    },
    {
      name: 'a function of the file called at mount time only',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        const total = () => derive([a$, b$], (a, b) => a + b);
        const Row = () => {
          const total$ = total();
          return <button onClick={() => { log(total$); }} />;
        };
      `,
    },
    {
      name: 'a scope made with a parent, which is disposed with it',
      filename: tsx,
      code: dedent`
        import { createScope, derive } from 'synstate';
        const Row = () => (
          <button onClick={() => { createScope(rowScope).run(() => keep(derive([a$], (a) => a))); }} />
        );
      `,
    },
    {
      // `scope.run(build)` is fine. `createScope().run(build)` leaks, but is a
      // miss the README names: a function passed by name is not followed (see
      // 'a function of the file passed as a value, not called').
      name: 'a function of the file passed by name to a scope’s run',
      filename: tsx,
      code: dedent`
        import { createScope, derive } from 'synstate';
        const build = () => { keep(derive([a$], (a) => a)); };
        const Row = () => (
          <>
            <button onClick={() => { scope.run(build); }} />
            <button onClick={() => { createScope().run(build); }} />
          </>
        );
      `,
    },
    {
      name: 'an app that render mounts in a root scope, from a function a handler calls',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        import { render } from 'synstate-dom';
        const openDialog = () => render(() => <Dialog total$={derive([a$], (a) => a)} />, root);
        const Row = () => <button onClick={() => { unmountDialog = openDialog(); }} />;
      `,
    },
    {
      // A miss the README names: a scope bound in the handler is trusted like
      // any other, although nothing disposes it.
      name: 'a scope bound in the handler, then run',
      filename: tsx,
      code: dedent`
        import { createScope, derive } from 'synstate';
        const Row = () => (
          <button onClick={() => { const scope = createScope(); scope.run(() => keep(derive([a$], (a) => a))); }} />
        );
      `,
    },
    {
      // The rule follows code written in the handler and functions of the file
      // it calls by name, not functions handed around as values: a component
      // passed on may be mounted later in its own scope, and a callback passed
      // to a timer by name is a miss the README names.
      name: 'a function of the file passed as a value, not called',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        const Settings = () => <div>{derive([a$], (a) => a)}</div>;
        const rebuild = () => { keep(derive([b$], (b) => b)); };
        const Nav = () => (
          <>
            <button onClick={() => { view.set(Settings); }} />
            <button onClick={() => { setTimeout(rebuild, 0); }} />
          </>
        );
      `,
    },
    {
      name: 'an addEventListener of the file’s own, not the global',
      code: dedent`
        import { derive } from 'synstate';
        import { addEventListener } from './events';
        addEventListener('focus', () => { keep(derive([a$], (a) => a)); });
      `,
    },
    {
      name: 'an addEventListener the file declares, not the global',
      code: dedent`
        import { derive } from 'synstate';
        const addEventListener = (type, listener) => { bus.on(type, listener); };
        addEventListener('focus', () => { keep(derive([a$], (a) => a)); });
      `,
    },
    {
      name: 'an addEventListener parameter, not the global',
      code: dedent`
        import { derive } from 'synstate';
        const listen = (addEventListener) => {
          addEventListener('blur', () => { keep(derive([b$], (b) => b)); });
        };
      `,
    },
  ],
  invalid: [
    {
      name: '`.pipe` with a synstate operator in an inline handler',
      filename: tsx,
      code: dedent`
        import { map } from 'synstate';
        const Row = () => <button onClick={() => { keep(count$.pipe(map((n) => n * 2))); }} />;
      `,
      errors: [{ messageId: 'observableInHandler', line: 2, column: 49 }],
    },
    {
      name: 'each creating call: combine, derive, merge, zip, fromSubscribable and an endless counter',
      filename: tsx,
      code: dedent`
        import { combine, counter, derive, fromSubscribable, merge, zip } from 'synstate';
        const Row = () => (
          <input
            onInput={() => {
              keep(combine([a$, b$]));
              keep(derive([a$, b$], (a, b) => a + b));
              keep(merge([a$, b$]));
              keep(zip([a$, b$]));
              keep(fromSubscribable(socket$));
              keep(counter(1000));
            }}
          />
        );
      `,
      errors: [
        { messageId: 'observableInHandler', line: 5 },
        { messageId: 'observableInHandler', line: 6 },
        { messageId: 'observableInHandler', line: 7 },
        { messageId: 'observableInHandler', line: 8 },
        { messageId: 'observableInHandler', line: 9 },
        { messageId: 'observableInHandler', line: 10 },
      ],
    },
    {
      name: 'synstate-dom’s deriveBindable, mapBindable and toObservable',
      filename: tsx,
      code: dedent`
        import { deriveBindable, mapBindable, toObservable } from 'synstate-dom';
        const Row = () => (
          <button
            onClick={() => {
              keep(deriveBindable([a$], (a) => a));
              keep(mapBindable(a$, (a) => a));
              keep(toObservable(label));
            }}
          />
        );
      `,
      errors: [
        { messageId: 'observableInHandler', line: 5 },
        { messageId: 'observableInHandler', line: 6 },
        { messageId: 'observableInHandler', line: 7 },
      ],
    },
    {
      name: 'a function of the file that a handler calls, and one that it calls',
      filename: tsx,
      code: dedent`
        import { derive, map } from 'synstate';
        const doubled = () => a$.pipe(map((a) => a * 2));
        function total() {
          keep(doubled());
          return derive([a$, b$], (a, b) => a + b);
        }
        const Row = () => <button onClick={() => { keep(total()); }} />;
      `,
      errors: [
        { messageId: 'observableInHandler', line: 2 },
        { messageId: 'observableInHandler', line: 5 },
      ],
    },
    {
      name: 'a scope made in the handler, which nothing disposes either',
      filename: tsx,
      code: dedent`
        import { createScope, derive, getCurrentScope } from 'synstate';
        const Row = () => (
          <button
            onClick={() => {
              createScope().run(() => keep(derive([a$], (a) => a)));
              createScope(undefined).run(() => keep(derive([b$], (b) => b)));
              createScope(getCurrentScope()).run(() => keep(derive([c$], (c) => c)));
              createScope(null).run(() => keep(derive([d$], (d) => d)));
              createScope(void 0).run(() => keep(derive([e$], (e) => e)));
            }}
          />
        );
      `,
      errors: [
        { messageId: 'observableInHandler', line: 5 },
        { messageId: 'observableInHandler', line: 6 },
        { messageId: 'observableInHandler', line: 7 },
        { messageId: 'observableInHandler', line: 8 },
        { messageId: 'observableInHandler', line: 9 },
      ],
    },
    {
      name: 'an inline callback the handler subscribes, schedules or iterates with',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        const Row = () => (
          <button
            onClick={() => {
              trigger$.subscribe(() => { keep(derive([a$], (a) => a)); });
              load().then(() => { keep(derive([b$], (b) => b)); });
              xs.forEach((x) => { keep(derive([x], (c) => c)); });
            }}
          />
        );
      `,
      errors: [
        { messageId: 'observableInHandler', line: 5 },
        { messageId: 'observableInHandler', line: 6 },
        { messageId: 'observableInHandler', line: 7 },
      ],
    },
    {
      name: 'a component written inline in the handler, though passed on',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        const Nav = () => (
          <button onClick={() => { view.set(() => <div>{derive([a$], (a) => a)}</div>); }} />
        );
      `,
      errors: [{ messageId: 'observableInHandler', line: 3 }],
    },
    {
      name: 'a function of the file called through a type wrapper',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        const setup = () => { keep(derive([a$], (a) => a)); };
        const Row = () => <button onClick={() => { (setup as () => void)(); }} />;
      `,
      errors: [{ messageId: 'observableInHandler', line: 2 }],
    },
    {
      name: 'a function of the file called in the arguments of a creation',
      filename: tsx,
      code: dedent`
        import { derive, merge } from 'synstate';
        const setup = () => { keep(derive([a$], (a) => a)); return x$; };
        const Row = () => <button onClick={() => { keep(merge([setup(), b$])); }} />;
      `,
      // The creation around the call is reported; what `setup` makes is left to
      // that report.
      errors: [{ messageId: 'observableInHandler', line: 3 }],
    },
    {
      name: 'an operator bound to a const of the file',
      filename: tsx,
      code: dedent`
        import { map } from 'synstate';
        const double = map((n) => n * 2);
        const Row = () => <button onClick={() => { keep(a$.pipe(double)); }} />;
      `,
      errors: [{ messageId: 'observableInHandler', line: 3 }],
    },
    {
      name: 'one report for a chain of pipes, and for a pipe inside a derive',
      filename: tsx,
      code: dedent`
        import { derive, filter, map } from 'synstate';
        const Row = () => (
          <button
            onClick={() => {
              keep(a$.pipe(filter((a) => a > 0)).pipe(map((a) => a * 2)));
              keep(derive([b$.pipe(map((b) => b * 2))], (b) => b));
            }}
          />
        );
      `,
      errors: [
        { messageId: 'observableInHandler', line: 5 },
        { messageId: 'observableInHandler', line: 6 },
      ],
    },
    {
      name: 'a handler chosen by a condition',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        const Row = () => (
          <>
            <button onClick={enabled ? () => { keep(derive([a$], (a) => a)); } : undefined} />
            <button onClick={enabled && (() => { keep(derive([b$], (b) => b)); })} />
          </>
        );
      `,
      errors: [
        { messageId: 'observableInHandler', line: 4 },
        { messageId: 'observableInHandler', line: 5 },
      ],
    },
    {
      name: 'a wrapper package’s operators',
      filename: tsx,
      code: dedent`
        import { map } from 'synstate-react-hooks';
        const Row = () => <button onClick={() => { keep(a$.pipe(map((a) => a))); }} />;
      `,
      errors: [{ messageId: 'observableInHandler' }],
    },
    {
      name: 'a namespace import and an alias',
      filename: tsx,
      code: dedent`
        import * as S from 'synstate';
        import { derive as d } from 'synstate';
        const Row = () => (
          <button onClick={() => { keep(a$.pipe(S.map((a) => a)), d([a$], (a) => a)); }} />
        );
      `,
      errors: [
        { messageId: 'observableInHandler' },
        { messageId: 'observableInHandler' },
      ],
    },
    {
      name: 'a handler named by a function declaration or a const of the file',
      filename: tsx,
      code: dedent`
        import { derive, map } from 'synstate';
        function onSave() {
          keep(derive([a$], (a) => a));
        }
        const onReset = () => {
          keep(a$.pipe(map((a) => a)));
        };
        const Row = () => (
          <>
            <button onClick={onSave} />
            <button onClick={onReset} />
            <button onDoubleClick={onReset} />
          </>
        );
      `,
      errors: [
        { messageId: 'observableInHandler', line: 3 },
        { messageId: 'observableInHandler', line: 6 },
      ],
    },
    {
      name: 'a function nested in the handler, run later',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        const Row = () => (
          <button onClick={() => { setTimeout(() => { keep(derive([a$], (a) => a)); }, 0); }} />
        );
      `,
      errors: [{ messageId: 'observableInHandler' }],
    },
    {
      name: 'the part after an await, outside the run',
      filename: tsx,
      code: dedent`
        import { derive, getCurrentScope } from 'synstate';
        const Row = () => {
          const scope = getCurrentScope();
          return (
            <button
              onClick={async () => {
                await save();
                scope?.run(() => keep(derive([a$], (a) => a)));
                keep(derive([b$], (b) => b));
              }}
            />
          );
        };
      `,
      errors: [{ messageId: 'observableInHandler', line: 9 }],
    },
    {
      name: 'listeners added with listenInScope and addEventListener',
      code: dedent`
        import { derive } from 'synstate';
        import { listenInScope } from 'synstate-dom';
        listenInScope(window, 'resize', () => { keep(derive([a$], (a) => a)); });
        window.addEventListener('scroll', () => { keep(derive([b$], (b) => b)); });
        addEventListener('focus', () => { keep(derive([c$], (c) => c)); });
      `,
      errors: [
        { messageId: 'observableInHandler', line: 3 },
        { messageId: 'observableInHandler', line: 4 },
        { messageId: 'observableInHandler', line: 5 },
      ],
    },
    {
      name: 'a function of the file passed by name as a listener',
      filename: tsx,
      code: dedent`
        import { derive } from 'synstate';
        import { listenInScope } from 'synstate-dom';
        const onScroll = () => { keep(derive([a$], (a) => a)); };
        const onResize = () => { keep(derive([b$], (b) => b)); };
        const onFocus = () => { keep(derive([c$], (c) => c)); };
        const onKey = () => { keep(derive([d$], (d) => d)); };
        listenInScope(window, 'resize', onResize);
        addEventListener('focus', onFocus);
        window.addEventListener('keydown', onKey);
        const Row = () => <button onClick={() => { el.addEventListener('scroll', onScroll); }} />;
      `,
      errors: [
        { messageId: 'observableInHandler', line: 3 },
        { messageId: 'observableInHandler', line: 4 },
        { messageId: 'observableInHandler', line: 5 },
        { messageId: 'observableInHandler', line: 6 },
      ],
    },
  ],
});

describe('no-observable-in-handler through type wrappers', () => {
  ruleTester.run('no-observable-in-handler', noObservableInHandler, {
    valid: [
      {
        name: 'a run callback in a type wrapper still exempts',
        filename: tsx,
        code: dedent`
          import { derive } from 'synstate';
          const Row = () => (
            <button onClick={() => { scope.run((() => keep(derive([a$], (a) => a))) satisfies () => void); }} />
          );
        `,
      },
    ],
    invalid: [
      {
        name: 'a handler and a callee in `as`, `satisfies` and `!`',
        filename: tsx,
        code: dedent`
          import { derive, map } from 'synstate';
          const Row = () => (
            <>
              <button onClick={(() => { keep((derive as typeof derive)([a$], (a) => a)); }) satisfies () => void} />
              <button onClick={(() => { keep(a$!.pipe((map satisfies typeof map)((a) => a))); }) as () => void} />
            </>
          );
        `,
        errors: [
          { messageId: 'observableInHandler', line: 4 },
          { messageId: 'observableInHandler', line: 5 },
        ],
      },
      {
        name: 'a named handler in a type wrapper',
        filename: tsx,
        code: dedent`
          import { derive } from 'synstate';
          const onSave = (() => { keep(derive([a$], (a) => a)); }) satisfies () => void;
          const Row = () => <button onClick={onSave as () => void} />;
        `,
        errors: [{ messageId: 'observableInHandler', line: 2 }],
      },
      {
        name: 'a listener call and a listener in a type wrapper',
        code: dedent`
          import { derive } from 'synstate';
          const onFocus = () => { keep(derive([a$], (a) => a)); };
          (addEventListener as typeof addEventListener)('focus', onFocus satisfies () => void);
          (window.addEventListener as Window['addEventListener'])('blur', (() => { keep(derive([b$], (b) => b)); }) as () => void);
        `,
        errors: [
          { messageId: 'observableInHandler', line: 2 },
          { messageId: 'observableInHandler', line: 4 },
        ],
      },
    ],
  });
});

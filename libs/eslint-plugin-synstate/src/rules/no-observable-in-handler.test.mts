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
    {
      name: 'a subscription made at mount time, which the scope ends',
      filename: tsx,
      code: dedent`
        import { createState } from 'synstate';
        const Row = () => {
          const [count$] = createState(0);
          count$.subscribe(log);
          return <button onClick={() => { log(count$); }} />;
        };
      `,
    },
    {
      name: 'a subscription made in a handler under `untracked`, which keeps it on purpose',
      filename: tsx,
      code: dedent`
        import { createState, untracked } from 'synstate';
        const [count$] = createState(0);
        const Row = () => <button onClick={() => { untracked(() => count$.subscribe(log)); }} />;
      `,
    },
    {
      name: 'subscribe on a const bound to an observable that completes by itself',
      filename: tsx,
      code: dedent`
        import { just, timer } from 'synstate';
        const flash$ = timer(300);
        const one$ = just(1);
        const Row = () => <button onClick={() => { flash$.subscribe(log); one$.subscribe(log); }} />;
      `,
    },
    {
      name: 'subscribe on a pipe of an observable that completes by itself, or ended by take',
      filename: tsx,
      code: dedent`
        import { createState, map, take, timer } from 'synstate';
        const [count$] = createState(0);
        const first = take(1);
        const flash$ = timer(300).pipe(map(() => false));
        const once$ = count$.pipe(take(1));
        const chained$ = timer(300).pipe(map(() => 1)).pipe(map((n) => n + 1));
        const bound$ = count$.pipe(first);
        const Row = () => (
          <button
            onClick={() => {
              flash$.subscribe(log);
              once$.subscribe(log);
              chained$.subscribe(log);
              bound$.subscribe(log);
            }}
          />
        );
      `,
    },
    {
      name: 'subscribe on something not known to be a synstate observable',
      filename: tsx,
      code: dedent`
        const Row = ({ emitter }) => <button onClick={() => { emitter.subscribe(log); }} />;
      `,
    },
    {
      name: 'unsubscribing in a handler',
      filename: tsx,
      code: dedent`
        import { createState } from 'synstate';
        const [count$] = createState(0);
        const Row = () => {
          const subscription = count$.subscribe(log);
          return <button onClick={() => { subscription.unsubscribe(); }} />;
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
    {
      name: 'subscribe on a state in an inline handler',
      filename: tsx,
      code: dedent`
        import { createState } from 'synstate';
        const [count$] = createState(0);
        const Row = () => <button onClick={() => { count$.subscribe(log); }} />;
      `,
      errors: [{ messageId: 'subscriptionInHandler', line: 3, column: 44 }],
    },
    {
      name: 'subscribe on an observable made by a synstate factory, in a listener and a function it calls',
      filename: tsx,
      code: dedent`
        import { source } from 'synstate';
        import { listenInScope } from 'synstate-dom';
        const ticks$ = source();
        const follow = () => { ticks$.subscribe(log); };
        listenInScope(window, 'resize', () => { follow(); });
      `,
      errors: [{ messageId: 'subscriptionInHandler', line: 4 }],
    },
    {
      name: 'subscribe on a const piped from a lasting observable with no ending operator',
      filename: tsx,
      code: dedent`
        import { createState, map } from 'synstate';
        const [count$] = createState(0);
        const doubled$ = count$.pipe(map((n) => n * 2));
        const Row = () => <button onClick={() => { doubled$.subscribe(log); }} />;
      `,
      errors: [{ messageId: 'subscriptionInHandler', line: 4 }],
    },
    {
      name: 'subscribe on a pipe ended only by takeUntil or takeWhile',
      filename: tsx,
      code: dedent`
        import { createState, takeUntil, takeWhile } from 'synstate';
        const [count$] = createState(0);
        const [closed$] = createState(false);
        const untilClosed$ = count$.pipe(takeUntil(closed$));
        const whileSmall$ = count$.pipe(takeWhile((n) => n < 10));
        const Row = () => <button onClick={() => { untilClosed$.subscribe(log); whileSmall$.subscribe(log); }} />;
      `,
      errors: [
        { messageId: 'subscriptionInHandler', line: 6 },
        { messageId: 'subscriptionInHandler', line: 6 },
      ],
    },
    {
      name: 'a const that pipes back into itself does not overflow the stack',
      filename: tsx,
      code: dedent`
        import { map } from 'synstate';
        const a$ = b$.pipe(map((x) => x));
        const b$ = a$.pipe(map((x) => x));
        const Row = () => <button onClick={() => { a$.subscribe(log); }} />;
      `,
      errors: [{ messageId: 'subscriptionInHandler', line: 4 }],
    },
    {
      name: 'subscribe on an observable derived in the handler reports both',
      filename: tsx,
      code: dedent`
        import { map } from 'synstate';
        const Row = () => <button onClick={() => { count$.pipe(map((n) => n * 2)).subscribe(log); }} />;
      `,
      errors: [
        { messageId: 'observableInHandler', line: 2 },
        { messageId: 'subscriptionInHandler', line: 2 },
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

describe('no-observable-in-handler after an await', () => {
  ruleTester.run('no-observable-in-handler', noObservableInHandler, {
    valid: [
      {
        name: 'code before the first `await`, which still runs in the scope',
        filename: tsx,
        code: dedent`
          import { createState, map } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              const doubled$ = count$.pipe(map((n) => n * 2));
              doubled$.subscribe(log);
              await ready;
            })();
            return <span />;
          };
        `,
      },
      {
        name: 'work after the `await` in the run of a scope taken before it',
        filename: tsx,
        code: dedent`
          import { createState, getCurrentScope, map } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            const scope = getCurrentScope();
            void (async () => {
              await ready;
              scope?.run(() => {
                keep(count$.pipe(map((n) => n * 2)));
                count$.subscribe(log);
              });
            })();
            return <span />;
          };
        `,
      },
      {
        name: 'work after the `await` under `untracked`, which belongs to no scope on purpose',
        filename: tsx,
        code: dedent`
          import { createState, untracked } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              await ready;
              untracked(() => count$.subscribe(log));
            })();
            return <span />;
          };
        `,
      },
      {
        name: 'an async function in a file with no JSX, which no component starts here',
        filename: tsx,
        code: dedent`
          import { createState, map } from 'synstate';
          const [count$] = createState(0);
          export const load = async () => {
            await ready;
            keep(count$.pipe(map((n) => n * 2)));
            count$.subscribe(log);
          };
        `,
      },
      {
        name: 'an `await` of a nested function, which the outer code does not wait for',
        filename: tsx,
        code: dedent`
          import { map } from 'synstate';
          const Row = () => {
            const save = async () => { await post(); };
            keep(count$.pipe(map((n) => n * 2)));
            return <button onClick={save} />;
          };
        `,
      },
      {
        name: 'a module-level async bootstrap, whose only JSX is the app it renders',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          import { render } from 'synstate-dom';
          const [count$] = createState(0);
          const main = async () => {
            await init();
            count$.subscribe(persist);
            render(() => <App />, root);
          };
        `,
      },
      {
        name: 'work under `untracked` in a type wrapper, after the `await`',
        filename: tsx,
        code: dedent`
          import { createState, untracked } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              await ready;
              untracked((() => count$.subscribe(log)) satisfies () => unknown);
            })();
            return <span />;
          };
        `,
      },
      {
        name: 'a React bootstrap, whose only JSX is the app it renders',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          const start = () => {
            void (async () => {
              await init();
              count$.subscribe(persist);
              root.render(<App />);
            })();
          };
        `,
      },
      {
        name: 'the iterated expression of a `for await`, read before the first pass',
        filename: tsx,
        code: dedent`
          import { map } from 'synstate';
          const Row = () => {
            void (async () => {
              for await (const n of toIterable(count$.pipe(map((n) => n * 2)))) {
                log(n);
              }
            })();
            return <span />;
          };
        `,
      },
    ],
    invalid: [
      {
        name: 'a subscription after an `await` in an async function a component starts',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              await ready;
              count$.subscribe(log);
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'subscriptionAfterAwait', line: 6, column: 5 }],
      },
      {
        name: 'a `.pipe` with a synstate operator after an `await`',
        filename: tsx,
        code: dedent`
          import { map } from 'synstate';
          const Row = () => {
            void (async () => {
              const config = await load();
              keep(count$.pipe(map((n) => n * config.scale)));
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'observableAfterAwait', line: 5, column: 10 }],
      },
      {
        name: 'in a loop that awaits, from the second pass on',
        filename: tsx,
        code: dedent`
          import { map } from 'synstate';
          const Row = () => {
            void (async () => {
              for (const id of ids) {
                keep(item$(id).pipe(map((x) => x)));
                await tick();
              }
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'observableAfterAwait', line: 5 }],
      },
      {
        name: 'in the body of a `for await`',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              for await (const n of numbers) {
                count$.subscribe(log);
              }
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'subscriptionAfterAwait', line: 6 }],
      },
      {
        name: 'after an `await` in an async callback of `run`, which is in the scope only until then',
        filename: tsx,
        code: dedent`
          import { getCurrentScope, map } from 'synstate';
          const Row = () => {
            const scope = getCurrentScope();
            void scope?.run(async () => {
              await ready;
              keep(count$.pipe(map((n) => n * 2)));
            });
            return <span />;
          };
        `,
        errors: [{ messageId: 'observableAfterAwait', line: 6 }],
      },
      {
        name: 'in a function of the file that code after an `await` calls by name',
        filename: tsx,
        code: dedent`
          import { derive } from 'synstate';
          const build = () => keep(derive([a$, b$], (a, b) => a + b));
          const Row = () => {
            useEffectLike(async () => {
              await ready;
              build();
            });
            return <span />;
          };
        `,
        errors: [{ messageId: 'observableAfterAwait', line: 2 }],
      },
      {
        name: 'an `await` in the call’s own callee or arguments',
        filename: tsx,
        code: dedent`
          import { createState, map } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              keep((await loadStore()).count$.pipe(map((n) => n * 2)));
              count$.subscribe(await makeLogger());
            })();
            return <span />;
          };
        `,
        errors: [
          { messageId: 'observableAfterAwait', line: 5 },
          { messageId: 'subscriptionAfterAwait', line: 6 },
        ],
      },
      {
        name: 'in a `do … while` whose test awaits, from the second pass on',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              do { count$.subscribe(log); } while (await more());
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'subscriptionAfterAwait', line: 5 }],
      },
      {
        name: 'a function declaration called after the `await`',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              await ready;
              init();
              function init() { count$.subscribe(log); }
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'subscriptionAfterAwait', line: 7 }],
      },
      {
        name: 'an async callback of `run` in a type wrapper, after its `await`',
        filename: tsx,
        code: dedent`
          import { getCurrentScope, map } from 'synstate';
          const Row = () => {
            const scope = getCurrentScope();
            void scope?.run((async () => {
              await ready;
              keep(count$.pipe(map((n) => n * 2)));
            }) as () => Promise<void>);
            return <span />;
          };
        `,
        errors: [{ messageId: 'observableAfterAwait', line: 6 }],
      },
      {
        name: 'a component whose JSX is only in the async function or in a callback',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          const Lazy = () => {
            void (async () => {
              await ready;
              count$.subscribe(log);
              view.set(<div />);
            })();
            return view;
          };
          const List = ({ items }) => {
            void (async () => {
              await ready;
              count$.subscribe(log);
            })();
            return items.map((i) => <li>{i}</li>);
          };
        `,
        errors: [
          { messageId: 'subscriptionAfterAwait', line: 6 },
          { messageId: 'subscriptionAfterAwait', line: 14 },
        ],
      },
      {
        name: 'a function declaration first passed by reference after the `await`',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              await ready;
              function attach() { count$.subscribe(log); }
              items.forEach(attach);
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'subscriptionAfterAwait', line: 6 }],
      },
      {
        name: 'an `await` on a branch of the arguments, which may run first',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              count$.subscribe(flag ? log : await makeLogger());
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'subscriptionAfterAwait', line: 5 }],
      },
      {
        name: 'a function declaration written after the `await`, judged by where it is written',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          const Row = () => {
            void (async () => {
              init();
              await ready;
              function init() { count$.subscribe(log); }
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'subscriptionAfterAwait', line: 7 }],
      },
      {
        name: 'an async component, whose own JSX makes it one',
        filename: tsx,
        code: dedent`
          import { createState } from 'synstate';
          const [count$] = createState(0);
          export const Lazy = async () => {
            await ready;
            count$.subscribe(log);
            return <div />;
          };
        `,
        errors: [{ messageId: 'subscriptionAfterAwait', line: 5 }],
      },
      {
        name: 'in the test of a loop whose body awaits, from the second pass on',
        filename: tsx,
        code: dedent`
          import { map } from 'synstate';
          const Row = () => {
            void (async () => {
              while (keep(count$.pipe(map((n) => n > 0))).getSnapshot().value) {
                await tick();
              }
            })();
            return <span />;
          };
        `,
        errors: [{ messageId: 'observableAfterAwait', line: 4 }],
      },
      {
        name: 'an async handler is reported as a handler',
        filename: tsx,
        code: dedent`
          import { map } from 'synstate';
          const Row = () => (
            <button onClick={async () => { await save(); keep(count$.pipe(map((n) => n))); }} />
          );
        `,
        errors: [{ messageId: 'observableInHandler', line: 3 }],
      },
    ],
  });
});

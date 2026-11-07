import {
  constant,
  If,
  MatchOptional,
  MatchResult,
  render,
  type JSX,
} from 'synstate-dom-next';
import {
  createState,
  map,
  mergeMap,
  switchMap,
  withInitialValue,
  type InitializedObservable,
} from 'synstate-next';
import { Optional, Result } from 'ts-data-forge';

// A switch bound to an observable is marked by a comment at each end, where
// synstate-dom has one after it; one given a constant has none.
const mountInto = (
  app: () => JSX.Element,
): Readonly<{
  container: HTMLDivElement;
  unmount: () => void;
}> => {
  const container = document.createElement('div');

  const unmount = render(app, container);

  return { container, unmount };
};

/** Counts the calls of a component, and the values it derived. */
const tracked = (
  label: string,
): Readonly<{
  Component: () => JSX.Element;
  calls: Readonly<{ current: number }>;
}> => {
  const mut_calls = { current: 0 };

  const Component = (): JSX.Element => {
    mut_calls.current += 1;

    return <span>{constant(label)}</span>;
  };

  return { Component, calls: mut_calls };
};

describe(If, () => {
  test('mounts only the branch chosen', () => {
    const [cond$, setCond] = createState(false);

    const a = tracked('a');

    const b = tracked('b');

    const { container } = mountInto(() => (
      <p>
        <If cond={cond$} then={<a.Component />} else={<b.Component />} />
      </p>
    ));

    assert.strictEqual(container.textContent, 'b');

    assert.strictEqual(a.calls.current, 0);

    setCond(true);

    assert.strictEqual(container.textContent, 'a');

    assert.strictEqual(a.calls.current, 1);

    setCond(false);

    assert.strictEqual(container.textContent, 'b');

    assert.strictEqual(b.calls.current, 2);
  });

  test('rebuilds a branch only when cond flips', () => {
    const [n$, setN] = createState(1);

    const a = tracked('a');

    mountInto(() => (
      <If cond={n$.pipe(map((n) => n > 0))} then={<a.Component />} />
    ));

    setN(2);

    setN(3);

    assert.strictEqual(a.calls.current, 1);
  });

  test('an omitted else mounts nothing', () => {
    const [cond$, setCond] = createState(true);

    const { container } = mountInto(() => (
      <p>
        <If cond={cond$} then={<b />} />
        <i />
      </p>
    ));

    assert.strictEqual(
      container.getHTML(),
      '<p><!----><b></b><!----><i></i></p>',
    );

    setCond(false);

    assert.strictEqual(container.getHTML(), '<p><!----><!----><i></i></p>');
  });

  test('disposes the branch it leaves', () => {
    const [cond$, setCond] = createState(true);

    const [count$, setCount] = createState(0);

    const mut_runs = { current: 0 };

    const Branch = (): JSX.Element => {
      const doubled$ = count$.pipe(
        map((n) => {
          mut_runs.current += 1;

          return n * 2;
        }),
      );

      return <span>{doubled$}</span>;
    };

    mountInto(() => <If cond={cond$} then={<Branch />} />);

    setCount(1);

    const runsBefore = mut_runs.current;

    setCond(false);

    setCount(2);

    assert.strictEqual(mut_runs.current, runsBefore);
  });

  test('keeps its nodes right when it is the top level and unmounts', () => {
    const [cond$, setCond] = createState(true);

    const { container, unmount } = mountInto(() => (
      <If cond={cond$} then={<b />} else={<i />} />
    ));

    setCond(false);

    setCond(true);

    assert.strictEqual(container.getHTML(), '<!----><b></b><!---->');

    unmount();

    assert.strictEqual(container.getHTML(), '');
  });

  test('nested switches inside a branch are removed with it', () => {
    const [outer$, setOuter] = createState(true);

    const [inner$, setInner] = createState(true);

    const { container } = mountInto(() => (
      <div>
        <If
          cond={outer$}
          then={<If cond={inner$} then={<b />} else={<i />} />}
        />
      </div>
    ));

    setInner(false);

    assert.strictEqual(
      container.getHTML(),
      '<div><!----><!----><i></i><!----><!----></div>',
    );

    setOuter(false);

    assert.strictEqual(container.getHTML(), '<div><!----><!----></div>');
  });

  test('a constant cond mounts one branch', () => {
    const { container } = mountInto(() => (
      <If cond={constant(false)} then={<b />} else={<i />} />
    ));

    assert.strictEqual(container.getHTML(), '<i></i>');
  });
});

describe(MatchOptional, () => {
  test('passes the present value as an observable and follows it', () => {
    const [user$, setUser] = createState<Optional<string>>(Optional.none);

    const mut_someCalls = { current: 0 };

    const Profile = ({
      name$,
    }: Readonly<{ name$: InitializedObservable<string> }>): JSX.Element => {
      mut_someCalls.current += 1;

      return <b>{name$}</b>;
    };

    const { container } = mountInto(() => (
      <MatchOptional
        value={user$}
        some={(name$) => <Profile name$={name$} />}
        none={<i>{constant('login')}</i>}
      />
    ));

    assert.strictEqual(container.textContent, 'login');

    setUser(Optional.some('alice'));

    assert.strictEqual(container.textContent, 'alice');

    setUser(Optional.some('bob'));

    assert.strictEqual(container.textContent, 'bob');

    assert.strictEqual(mut_someCalls.current, 1);

    setUser(Optional.none);

    assert.strictEqual(container.textContent, 'login');
  });

  test('takes a constant', () => {
    const { container } = mountInto(() => (
      <MatchOptional
        value={constant(Optional.some(1))}
        some={(n$) => <b>{n$}</b>}
      />
    ));

    assert.strictEqual(container.getHTML(), '<b>1</b>');
  });
});

describe(MatchResult, () => {
  test('switches between ok and err and follows the value within a tag', () => {
    const [result$, setResult] = createState<Result<number, string>>(
      Result.ok(1),
    );

    const { container } = mountInto(() => (
      <MatchResult
        value={result$}
        ok={(n$) => <b>{n$}</b>}
        err={(e$) => <i>{e$}</i>}
      />
    ));

    assert.strictEqual(container.getHTML(), '<!----><b>1</b><!---->');

    setResult(Result.ok(2));

    assert.strictEqual(container.getHTML(), '<!----><b>2</b><!---->');

    setResult(Result.err('oops'));

    assert.strictEqual(container.getHTML(), '<!----><i>oops</i><!---->');
  });
});

type User = Readonly<{ name: string }>;

/**
 * A branch that reads `user$` narrowed by the switch above it, as the user
 * would write it, and records every value its derived node computes.
 */
const narrowingBranch = (
  user$: InitializedObservable<User | undefined>,
): Readonly<{
  Branch: () => JSX.Element;
  seen: readonly (string | undefined)[];
}> => {
  const mut_seen: (string | undefined)[] = [];

  const Branch = (): JSX.Element => (
    <b>
      {user$.pipe(
        map((u) => {
          mut_seen.push(u?.name);

          // The switch rules `undefined` out; reaching it here is the bug.
          return u === undefined ? 'unreachable' : u.name;
        }),
      )}
    </b>
  );

  return { Branch, seen: mut_seen };
};

// synstate-dom #3630 (issue #3605). Here the switch's effect runs after the
// drain, so without the check in the drain a branch would compute from the
// ruled-out value however shallow `cond` is.
describe('a branch the value rules out computes nothing from it (#3605)', () => {
  test('If, cond read straight from the source', () => {
    const [user$, setUser] = createState<User | undefined>({ name: 'a' });

    const { Branch, seen } = narrowingBranch(user$);

    const cond$ = user$.pipe(map((u) => u !== undefined));

    const { container } = mountInto(() => (
      <p>
        <If cond={cond$} then={<Branch />} />
      </p>
    ));

    setUser({ name: 'b' });

    setUser(undefined);

    assert.strictEqual(container.textContent, '');

    assert.deepStrictEqual(seen, ['a', 'b']);
  });

  test('If, cond two steps from the source', () => {
    const [user$, setUser] = createState<User | undefined>({ name: 'a' });

    const { Branch, seen } = narrowingBranch(user$);

    const cond$ = user$.pipe(map((u) => u)).pipe(map((u) => u !== undefined));

    const { container } = mountInto(() => (
      <p>
        <If cond={cond$} then={<Branch />} />
      </p>
    ));

    setUser({ name: 'b' });

    setUser(undefined);

    assert.strictEqual(container.textContent, '');

    assert.deepStrictEqual(seen, ['a', 'b']);
  });

  test('If, the branch mounted again when cond comes back', () => {
    const [user$, setUser] = createState<User | undefined>({ name: 'a' });

    const { Branch, seen } = narrowingBranch(user$);

    const cond$ = user$.pipe(map((u) => u !== undefined));

    const { container } = mountInto(() => (
      <p>
        <If cond={cond$} then={<Branch />} />
      </p>
    ));

    setUser(undefined);

    setUser({ name: 'c' });

    assert.strictEqual(container.textContent, 'c');

    assert.deepStrictEqual(seen, ['a', 'c']);
  });

  test('MatchOptional', () => {
    const [user$, setUser] = createState<User | undefined>({ name: 'a' });

    const { Branch, seen } = narrowingBranch(user$);

    const value$ = user$
      .pipe(map((u) => u))
      .pipe(map((u) => (u === undefined ? Optional.none : Optional.some(u))));

    const { container } = mountInto(() => (
      <MatchOptional
        value={value$}
        some={() => <Branch />}
        none={<i>{constant('login')}</i>}
      />
    ));

    setUser(undefined);

    assert.strictEqual(container.textContent, 'login');

    assert.deepStrictEqual(seen, ['a']);
  });

  test('MatchResult', () => {
    const [user$, setUser] = createState<User | undefined>({ name: 'a' });

    const { Branch, seen } = narrowingBranch(user$);

    const value$ = user$
      .pipe(map((u) => u))
      .pipe(
        map((u): Result<User, string> =>
          u === undefined ? Result.err('gone') : Result.ok(u),
        ),
      );

    const { container } = mountInto(() => (
      <MatchResult
        value={value$}
        ok={() => <Branch />}
        err={(e$) => <i>{e$}</i>}
      />
    ));

    setUser(undefined);

    assert.strictEqual(container.textContent, 'gone');

    assert.deepStrictEqual(seen, ['a']);
  });

  test('a nested switch', () => {
    const [user$, setUser] = createState<User | undefined>({ name: 'a' });

    const { Branch, seen } = narrowingBranch(user$);

    const [shown$, setShown] = createState(true);

    const cond$ = user$.pipe(map((u) => u !== undefined));

    const { container } = mountInto(() => (
      <If
        cond={shown$}
        then={
          <p>
            <If cond={cond$} then={<Branch />} />
          </p>
        }
      />
    ));

    setUser(undefined);

    setShown(false);

    setShown(true);

    setUser({ name: 'd' });

    assert.strictEqual(container.textContent, 'd');

    assert.deepStrictEqual(seen, ['a', 'd']);
  });

  test.each([
    ['switchMap', switchMap],
    ['mergeMap', mergeMap],
  ] as const)('what a %s made in the branch projects', (_name, flatten) => {
    const [user$, setUser] = createState<User | undefined>({ name: 'a' });

    const mut_seen: (string | undefined)[] = [];

    const [trigger$] = createState(0);

    // The projection's nodes belong to the operator's own owner, not to the
    // branch's.
    const Branch = (): JSX.Element => (
      <b>
        {trigger$
          .pipe(
            flatten(() =>
              user$.pipe(
                map((u) => {
                  mut_seen.push(u?.name);

                  return u === undefined ? 'unreachable' : u.name;
                }),
              ),
            ),
          )
          .pipe(withInitialValue(''))}
      </b>
    );

    const cond$ = user$.pipe(map((u) => u !== undefined));

    const { container } = mountInto(() => (
      <p>
        <If cond={cond$} then={<Branch />} />
      </p>
    ));

    setUser({ name: 'b' });

    setUser(undefined);

    assert.strictEqual(container.textContent, '');

    assert.deepStrictEqual(mut_seen, ['a', 'b']);
  });
});

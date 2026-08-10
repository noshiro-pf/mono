/**
 * Comparison tests: how SynState, RxJS, and Jotai handle circular dependencies.
 *
 * - SynState: detects cycles at construction time and throws a clear error.
 * - RxJS: pipe() always returns a new Observable, so static cycles cannot be
 *   expressed through the public API. No detection is needed or provided.
 * - Jotai: circular atom definitions are silently accepted. A cycle manifests
 *   only at read time as a `Maximum call stack size exceeded` error.
 */
/* eslint-disable functional/immutable-data */
/* eslint-disable no-new */
import { type Atom, atom, createStore } from 'jotai';
import { BehaviorSubject, combineLatest, map as rxMap } from 'rxjs';
import { Optional } from 'ts-data-forge';
import { combine } from '../combine/index.mjs';
import { source } from '../create/index.mjs';
import { map } from '../operators/index.mjs';
import { SyncChildObservableClass } from './child-observable-class.mjs';
import { RootObservableClass } from './root-observable-class.mjs';

describe('circular dependency comparison', () => {
  describe('SynState', () => {
    test('detects cycle at construction time with a clear error message', () => {
      const root = new RootObservableClass({
        initialValue: Optional.some(0),
      });

      const childA = new SyncChildObservableClass({
        parents: [root],
        initialValue: Optional.some(0),
      });

      const childB = new SyncChildObservableClass({
        parents: [childA],
        initialValue: Optional.some(0),
      });

      // Simulate a cycle: childA → childB → childA
      // In normal usage this is impossible — the check runs in every
      // child constructor before the reference becomes available.
      Object.defineProperty(childA, 'parents', {
        value: [childB],
        writable: false,
        configurable: true,
      });

      expect(() => {
        new SyncChildObservableClass({
          parents: [childA],
          initialValue: Optional.some(0),
        });
      }).toThrow(
        'Circular dependency detected in observable graph: a child observable cannot be its own ancestor.',
      );
    });

    test('accepts valid DAG (diamond dependency)', () => {
      const a$ = source(0);

      const b$ = a$.pipe(map((x) => x * 10));

      const c$ = a$.pipe(map((x) => x * 1000));

      expect(() => {
        combine([b$, c$]);
      }).not.toThrow();
    });
  });

  describe('RxJS', () => {
    test('cannot express static graph cycles — pipe() always creates new instances', () => {
      // RxJS pipe() returns a brand-new Observable each time, so there is no
      // way to construct a cycle through the public API.  This test documents
      // that behavior rather than asserting error detection.
      const a$ = new BehaviorSubject(0);

      const b$ = a$.pipe(rxMap((x) => x + 1));

      // b$ is a wholly separate object; there is no "parents" link back to a$.
      expect(a$).not.toBe(b$);

      // A diamond dependency works but produces glitches (intermediate states).
      const left$ = a$.pipe(rxMap((x) => x * 10));

      const right$ = a$.pipe(rxMap((x) => x * 1000));

      const combined$ = combineLatest([left$, right$]).pipe(
        rxMap(([l, r]) => l + r),
      );

      const mut_values: number[] = [];

      combined$.subscribe((v) => {
        mut_values.push(v);
      });

      a$.next(1);

      a$.next(2);

      // Glitch values (10, 1020) appear between the correct values.
      assert.deepStrictEqual(mut_values, [0, 10, 1010, 1020, 2020]);
    });
  });

  describe('Jotai', () => {
    test('does not detect circular atom definitions — crashes on read', () => {
      const store = createStore();

      // Two atoms that depend on each other — an obvious cycle.
      // Explicit type annotations are required because TypeScript cannot infer
      // the type of mutually-recursive initializers.
      const atomA: Atom<number> = atom((get) => get(atomB) + 1);

      const atomB: Atom<number> = atom((get) => get(atomA) + 1);

      // Definition succeeds without any error.
      // Reading triggers infinite recursion.
      expect(() => {
        store.get(atomA);
      }).toThrow('Maximum call stack size exceeded');
    });

    test('handles valid DAG (diamond dependency) correctly', () => {
      const store = createStore();

      const base = atom(1);

      const left = atom((get) => get(base) * 10);

      const right = atom((get) => get(base) * 1000);

      const combined = atom((get) => get(left) + get(right));

      expect(store.get(combined)).toBe(1010);

      store.set(base, 2);

      expect(store.get(combined)).toBe(2020);
    });
  });
});

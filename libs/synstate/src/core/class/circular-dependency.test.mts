/* eslint-disable functional/immutable-data */
/* eslint-disable no-new */
import { Optional } from 'ts-data-forge';
import { combine, merge } from '../combine/index.mjs';
import { source } from '../create/index.mjs';
import { map } from '../operators/index.mjs';
import {
  AsyncChildObservableClass,
  SyncChildObservableClass,
} from './child-observable-class.mjs';
import { RootObservableClass } from './root-observable-class.mjs';

describe('circular dependency detection', () => {
  describe('cycle in ancestor graph', () => {
    test('should throw when parent chain contains a cycle (A -> B -> A)', () => {
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

      // Mutate childA.parents to create a cycle: childA -> childB -> childA
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

    test('should throw when AsyncChildObservable parent chain contains a cycle', () => {
      const root = new RootObservableClass({
        initialValue: Optional.some(0),
      });

      const childA = new AsyncChildObservableClass({
        parents: [root],
        initialValue: Optional.some(0),
      });

      const childB = new SyncChildObservableClass({
        parents: [childA],
        initialValue: Optional.some(0),
      });

      // Create cycle: childA -> childB -> childA
      Object.defineProperty(childA, 'parents', {
        value: [childB],
        writable: false,
        configurable: true,
      });

      expect(() => {
        new AsyncChildObservableClass({
          parents: [childA],
          initialValue: Optional.some(0),
        });
      }).toThrow(
        'Circular dependency detected in observable graph: a child observable cannot be its own ancestor.',
      );
    });

    test('should throw when a cycle exists through a chain of 3 observables', () => {
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

      const childC = new SyncChildObservableClass({
        parents: [childB],
        initialValue: Optional.some(0),
      });

      // Create cycle: childA -> childC -> childB -> childA
      Object.defineProperty(childA, 'parents', {
        value: [childC],
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

    test('should throw when the new child itself appears as an ancestor', () => {
      const root = new RootObservableClass({
        initialValue: Optional.some(0),
      });

      const childA = new SyncChildObservableClass({
        parents: [root],
        initialValue: Optional.some(0),
      });

      // Make childA's parents reference childA itself (self-loop)
      Object.defineProperty(childA, 'parents', {
        value: [childA],
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
  });

  describe('valid DAG patterns should not throw', () => {
    test('diamond dependency is not a cycle', () => {
      const root = new RootObservableClass({
        initialValue: Optional.some(0),
      });

      const left = new SyncChildObservableClass({
        parents: [root],
        initialValue: Optional.some(0),
      });

      const right = new SyncChildObservableClass({
        parents: [root],
        initialValue: Optional.some(0),
      });

      // Diamond: root -> left -> combined, root -> right -> combined
      expect(() => {
        new SyncChildObservableClass({
          parents: [left, right],
          initialValue: Optional.some(0),
        });
      }).not.toThrow();
    });

    test('linear chain is not a cycle', () => {
      const root = new RootObservableClass({
        initialValue: Optional.some(0),
      });

      const a = new SyncChildObservableClass({
        parents: [root],
        initialValue: Optional.some(0),
      });

      const b = new SyncChildObservableClass({
        parents: [a],
        initialValue: Optional.some(0),
      });

      expect(() => {
        new SyncChildObservableClass({
          parents: [b],
          initialValue: Optional.some(0),
        });
      }).not.toThrow();
    });

    test('multiple roots converging is not a cycle', () => {
      const root1 = new RootObservableClass({
        initialValue: Optional.some(1),
      });

      const root2 = new RootObservableClass({
        initialValue: Optional.some(2),
      });

      const child1 = new SyncChildObservableClass({
        parents: [root1],
        initialValue: Optional.some(0),
      });

      const child2 = new SyncChildObservableClass({
        parents: [root2],
        initialValue: Optional.some(0),
      });

      expect(() => {
        new SyncChildObservableClass({
          parents: [child1, child2],
          initialValue: Optional.some(0),
        });
      }).not.toThrow();
    });

    test('combine with source observables works', () => {
      const a$ = source<number>();

      const b$ = source<string>();

      expect(() => {
        combine([a$, b$]);
      }).not.toThrow();
    });

    test('combine with derived observables works', () => {
      const a$ = source<number>();

      const b$ = source<number>();

      const mapped$ = a$.pipe(map((x) => x * 2));

      expect(() => {
        combine([mapped$, b$]);
      }).not.toThrow();
    });

    test('merge with source observables works', () => {
      const a$ = source<number>();

      const b$ = source<number>();

      expect(() => {
        merge([a$, b$]);
      }).not.toThrow();
    });
  });
});

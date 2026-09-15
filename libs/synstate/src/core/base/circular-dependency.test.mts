import { Optional } from 'ts-data-forge';
import { combine, merge } from '../combine/index.mjs';
import { source } from '../create/index.mjs';
import { map } from '../operators/index.mjs';
import {
  createAsyncChildObservable,
  createSyncChildObservable,
} from './create-child-observable.mjs';
import { createTryUpdateNotImplemented } from './create-observable-base.mjs';
import { createRootObservable } from './create-root-observable.mjs';

describe('circular dependency detection', () => {
  describe('cycle in ancestor graph', () => {
    test('should throw when parent chain contains a cycle (A -> B -> A)', () => {
      const root = createRootObservable(
        { initialValue: Optional.some(0) },
        () => ({}),
      );

      const mut_childA = createSyncChildObservable(
        {
          parents: [root],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      const childB = createSyncChildObservable(
        {
          parents: [mut_childA],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      // Mutate mut_childA.parents to create a cycle: mut_childA -> childB -> mut_childA
      Object.defineProperty(mut_childA, 'parents', {
        value: [childB],
        writable: false,
        configurable: true,
      });

      expect(() => {
        createSyncChildObservable(
          {
            parents: [mut_childA],
            initialValue: Optional.some(0),
          },
          createTryUpdateNotImplemented,
        );
      }).toThrow(
        'Circular dependency detected in observable graph: a child observable cannot be its own ancestor.',
      );
    });

    test('should throw when AsyncChildObservable parent chain contains a cycle', () => {
      const root = createRootObservable(
        { initialValue: Optional.some(0) },
        () => ({}),
      );

      const mut_childA = createAsyncChildObservable(
        {
          parents: [root],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      const childB = createSyncChildObservable(
        {
          parents: [mut_childA],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      // Create cycle: mut_childA -> childB -> mut_childA
      Object.defineProperty(mut_childA, 'parents', {
        value: [childB],
        writable: false,
        configurable: true,
      });

      expect(() => {
        createAsyncChildObservable(
          {
            parents: [mut_childA],
            initialValue: Optional.some(0),
          },
          createTryUpdateNotImplemented,
        );
      }).toThrow(
        'Circular dependency detected in observable graph: a child observable cannot be its own ancestor.',
      );
    });

    test('should throw when a cycle exists through a chain of 3 observables', () => {
      const root = createRootObservable(
        { initialValue: Optional.some(0) },
        () => ({}),
      );

      const mut_childA = createSyncChildObservable(
        {
          parents: [root],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      const childB = createSyncChildObservable(
        {
          parents: [mut_childA],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      const childC = createSyncChildObservable(
        {
          parents: [childB],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      // Create cycle: mut_childA -> childC -> childB -> mut_childA
      Object.defineProperty(mut_childA, 'parents', {
        value: [childC],
        writable: false,
        configurable: true,
      });

      expect(() => {
        createSyncChildObservable(
          {
            parents: [mut_childA],
            initialValue: Optional.some(0),
          },
          createTryUpdateNotImplemented,
        );
      }).toThrow(
        'Circular dependency detected in observable graph: a child observable cannot be its own ancestor.',
      );
    });

    test('should throw when the new child itself appears as an ancestor', () => {
      const root = createRootObservable(
        { initialValue: Optional.some(0) },
        () => ({}),
      );

      const mut_childA = createSyncChildObservable(
        {
          parents: [root],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      // Make mut_childA's parents reference mut_childA itself (self-loop)
      Object.defineProperty(mut_childA, 'parents', {
        value: [mut_childA],
        writable: false,
        configurable: true,
      });

      expect(() => {
        createSyncChildObservable(
          {
            parents: [mut_childA],
            initialValue: Optional.some(0),
          },
          createTryUpdateNotImplemented,
        );
      }).toThrow(
        'Circular dependency detected in observable graph: a child observable cannot be its own ancestor.',
      );
    });
  });

  describe('valid DAG patterns should not throw', () => {
    test('diamond dependency is not a cycle', () => {
      const root = createRootObservable(
        { initialValue: Optional.some(0) },
        () => ({}),
      );

      const left = createSyncChildObservable(
        {
          parents: [root],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      const right = createSyncChildObservable(
        {
          parents: [root],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      // Diamond: root -> left -> combined, root -> right -> combined
      expect(() => {
        createSyncChildObservable(
          {
            parents: [left, right],
            initialValue: Optional.some(0),
          },
          createTryUpdateNotImplemented,
        );
      }).not.toThrow();
    });

    test('linear chain is not a cycle', () => {
      const root = createRootObservable(
        { initialValue: Optional.some(0) },
        () => ({}),
      );

      const a = createSyncChildObservable(
        {
          parents: [root],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      const b = createSyncChildObservable(
        {
          parents: [a],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      expect(() => {
        createSyncChildObservable(
          {
            parents: [b],
            initialValue: Optional.some(0),
          },
          createTryUpdateNotImplemented,
        );
      }).not.toThrow();
    });

    test('multiple roots converging is not a cycle', () => {
      const root1 = createRootObservable(
        { initialValue: Optional.some(1) },
        () => ({}),
      );

      const root2 = createRootObservable(
        { initialValue: Optional.some(2) },
        () => ({}),
      );

      const child1 = createSyncChildObservable(
        {
          parents: [root1],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      const child2 = createSyncChildObservable(
        {
          parents: [root2],
          initialValue: Optional.some(0),
        },
        createTryUpdateNotImplemented,
      );

      expect(() => {
        createSyncChildObservable(
          {
            parents: [child1, child2],
            initialValue: Optional.some(0),
          },
          createTryUpdateNotImplemented,
        );
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

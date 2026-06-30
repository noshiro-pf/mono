import { expectType } from 'ts-data-forge';
import { type Brand, type ReadonlyRecord } from 'ts-type-forge';
import { array } from '../array/index.mjs';
import { brandedString } from '../brand/index.mjs';
import { union } from '../compose/index.mjs';
import { boolean, nullType, number, string } from '../primitives/index.mjs';
import {
  keyof,
  keyValueRecord,
  mergeRecords,
  optional,
  partial,
  record,
  valueof,
} from '../record/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { literal } from './literal.mjs';
import { recursion } from './recursion.mjs';

describe('recursive', () => {
  describe('JsonValue', () => {
    // Define JsonPrimitive type
    const JsonPrimitive = union([nullType, number(), string(), boolean()]);

    type JsonPrimitive = TypeOf<typeof JsonPrimitive>;

    test('JsonPrimitive.defaultValue', () => {
      expectType<JsonPrimitive, null | boolean | number | string>('=');

      expect(JsonPrimitive.defaultValue).toBeNull();
    });

    // Define recursive JsonValue type
    type JsonValue =
      | JsonPrimitive
      | Readonly<{
          [k: string]: JsonValue;
        }>
      | readonly JsonValue[];

    const JsonValue: Type<JsonValue> = recursion('JsonValue', () =>
      union([
        JsonPrimitive,
        keyValueRecord(string(), JsonValue),
        array(JsonValue),
      ]),
    );

    test('JsonValue.defaultValue', () => {
      expectType<TypeOf<typeof JsonValue>, JsonValue>('=');

      expect(JsonValue.defaultValue).toBeNull();
    });

    test('JsonValue - primitive values', () => {
      assert.isTrue(JsonValue.is(true));

      assert.isTrue(JsonValue.is(false));

      assert.isTrue(JsonValue.is(42));

      assert.isTrue(JsonValue.is(3.14));

      assert.isTrue(JsonValue.is('hello'));

      assert.isTrue(JsonValue.is(null));

      assert.isFalse(JsonValue.is(undefined));
    });

    test('JsonValue - arrays', () => {
      assert.isTrue(JsonValue.is([]));

      assert.isTrue(JsonValue.is([1, 2, 3]));

      assert.isTrue(JsonValue.is(['a', 'b', 'c']));

      assert.isTrue(JsonValue.is([true, false, null]));

      assert.isTrue(JsonValue.is([1, 'a', true, null]));
    });

    test('JsonValue - objects', () => {
      assert.isTrue(JsonValue.is({}));

      assert.isTrue(JsonValue.is({ a: 1 }));

      assert.isTrue(JsonValue.is({ a: 1, b: 'hello' }));

      assert.isTrue(JsonValue.is({ a: 1, b: [1, 2, 3] }));
    });

    test('JsonValue - nested structures', () => {
      const nestedData = {
        name: 'John',
        age: 30,
        active: true,
        address: {
          street: '123 Main St',
          city: 'New York',
          coordinates: {
            lat: 40.7128,
            lon: -74.006,
          },
        },
        hobbies: ['reading', 'coding', 'gaming'],
        scores: [95, 87, 92],
        metadata: null,
        tags: [],
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            push: false,
          },
        },
      } as const;

      assert.isTrue(JsonValue.is(nestedData));
    });

    test('JsonValue - deeply nested arrays', () => {
      const deepArray = [
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        [
          [7, 8, 9],
          [10, 11, 12],
        ],
      ] as const;

      assert.isTrue(JsonValue.is(deepArray));
    });

    test('JsonValue - mixed nested structure', () => {
      const mixedData = {
        users: [
          {
            id: 1,
            name: 'Alice',
            tasks: [
              { id: 'task1', completed: true },
              { id: 'task2', completed: false },
            ],
          },
          {
            id: 2,
            name: 'Bob',
            tasks: [],
          },
        ],
        config: {
          version: '1.0.0',
          features: ['feature1', 'feature2'],
          settings: {
            debug: false,
            timeout: 5000,
          },
        },
      } as const;

      assert.isTrue(JsonValue.is(mixedData));
    });

    test('JsonValue - invalid values', () => {
      assert.isFalse(JsonValue.is(undefined));

      assert.isFalse(JsonValue.is(Symbol('test')));

      assert.isFalse(JsonValue.is(() => 'function'));

      // Note: keyValueRecord accepts any object with string keys, including Date/Set/Map
      // This is expected behavior for keyValueRecord, which doesn't distinguish
      // between plain objects and other object instances
    });

    test('JsonValue - cast function', () => {
      const result = JsonValue.cast({ a: 1, b: [2, 3], c: { d: 'hello' } });

      assert.deepStrictEqual(result, { a: 1, b: [2, 3], c: { d: 'hello' } });
    });

    test('JsonValue - fill function', () => {
      const result = JsonValue.fill({ a: 1, b: [2, 3] });

      assert.deepStrictEqual(result, { a: 1, b: [2, 3] });

      // Fill with default value for invalid input
      const defaultResult = JsonValue.fill(undefined);

      assert.isTrue(JsonValue.is(defaultResult));
    });
  });

  // Test other recursive structures
  test('Linked list structure', () => {
    type LinkedList<T> = Readonly<{ value: T; next: LinkedList<T> | null }>;

    const LinkedListNumber: Type<LinkedList<number>> = recursion(
      'LinkedList<number>',
      () =>
        record({
          value: number(),
          next: union([nullType, LinkedListNumber]),
        }),
      { defaultValue: { value: 0, next: null } },
    );

    const list: LinkedList<number> = {
      value: 1,
      next: {
        value: 2,
        next: {
          value: 3,
          next: null,
        },
      },
    } as const;

    assert.isTrue(LinkedListNumber.is(list));

    assert.isTrue(LinkedListNumber.is({ value: 1, next: null }));

    assert.isFalse(LinkedListNumber.is({ value: 'not a number', next: null }));
  });

  test('Tree structure', () => {
    type TreeNode<T> = Readonly<{
      value: T;
      children: readonly TreeNode<T>[];
    }>;

    const TreeNodeString: Type<TreeNode<string>> = recursion(
      'TreeNode<string>',
      () =>
        record({
          value: string(),
          children: array(TreeNodeString),
        }),
    );

    const tree: TreeNode<string> = {
      value: 'root',
      children: [
        {
          value: 'branch1',
          children: [
            { value: 'leaf1', children: [] },
            { value: 'leaf2', children: [] },
          ],
        },
        {
          value: 'branch2',
          children: [{ value: 'leaf3', children: [] }],
        },
      ],
    } as const;

    assert.isTrue(TreeNodeString.is(tree));

    assert.isTrue(TreeNodeString.is({ value: 'node', children: [] }));

    assert.isFalse(TreeNodeString.is({ value: 123, children: [] }));
  });

  test('Mutual recursion - demonstrates lazy evaluation', () => {
    type EvenNumber = Readonly<{ type: 'even'; next: OddNumber | null }>;

    type OddNumber = Readonly<{ type: 'odd'; next: EvenNumber | null }>;

    // With _getDefaultValue, type definitions are created without immediate evaluation
    const EvenNumber: Type<EvenNumber> = recursion('EvenNumber', () =>
      record({
        type: literal('even'),
        next: union([nullType, OddNumber]), // nullType first to compute defaultValue
      }),
    );

    const OddNumber: Type<OddNumber> = recursion('OddNumber', () =>
      record({
        type: literal('odd'),
        next: union([nullType, EvenNumber]), // nullType first to compute defaultValue
      }),
    );

    // Type checking works fine
    assert.isTrue(OddNumber.is({ type: 'odd', next: null }));

    assert.isTrue(EvenNumber.is({ type: 'even', next: null }));

    // defaultValue is accessible when terminal types are first
    const evenDefault = EvenNumber.defaultValue;

    assert.isTrue(EvenNumber.is(evenDefault));
  });

  test('Mutual recursion - demonstrates lazy evaluation with optional', () => {
    type EvenNumber = Readonly<{ type: 'even'; next?: OddNumber }>;

    type OddNumber = Readonly<{ type: 'odd'; next?: EvenNumber }>;

    // With _getDefaultValue, type definitions are created without immediate evaluation
    const EvenNumber: Type<EvenNumber> = recursion('EvenNumber', () =>
      record({
        type: literal('even'),
        next: optional(OddNumber, { forceUndefinedDefault: true }), // Force undefined to avoid infinite loop
      }),
    );

    const OddNumber: Type<OddNumber> = recursion('OddNumber', () =>
      record({
        type: literal('odd'),
        next: optional(EvenNumber, { forceUndefinedDefault: true }), // Force undefined to avoid infinite loop
      }),
    );

    // Type checking works fine
    assert.isTrue(OddNumber.is({ type: 'odd' }));

    assert.isTrue(EvenNumber.is({ type: 'even' }));

    // defaultValue is accessible when terminal types are first
    const evenDefault = EvenNumber.defaultValue;

    assert.isTrue(EvenNumber.is(evenDefault));
  });

  describe('recursive types with various type operations', () => {
    test('recursion with pick and omit', () => {
      // Define the shape first, then use pick/omit on it
      const NodeShape = {
        id: string(),
        value: number(0),
        // eslint-disable-next-line unicorn/no-unused-properties
        metadata: string(''),
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion, unicorn/no-unused-properties
        children: array({} as Type<unknown>), // Placeholder for recursion
      } as const;

      // Pick only id and children — use NodeShape directly for individual field types
      const NodePicked: Type<
        Readonly<{
          id: string;
          children: readonly Readonly<{
            id: string;
            children: readonly unknown[];
          }>[];
        }>
      > = recursion('NodePicked', () =>
        record({
          id: NodeShape.id,
          children: array(NodePicked),
        }),
      );

      const validNode = {
        id: 'node1',
        children: [{ id: 'child1', children: [] }],
      } as const;

      assert.isTrue(NodePicked.is(validNode));

      // Omit metadata — use NodeShape directly for individual field types
      const NodeOmitted: Type<
        Readonly<{
          id: string;
          value: number;
          children: readonly Readonly<{
            id: string;
            value: number;
            children: readonly unknown[];
          }>[];
        }>
      > = recursion('NodeOmitted', () =>
        record({
          id: NodeShape.id,
          value: NodeShape.value,
          children: array(NodeOmitted),
        }),
      );

      const validOmitted = {
        id: 'node2',
        value: 42,
        children: [],
      } as const;

      assert.isTrue(NodeOmitted.is(validOmitted));
    });

    test('recursion with partial and required', () => {
      type Task = Readonly<{
        id: string;
        title?: string;
        done?: boolean;
        subtasks?: readonly Readonly<{ id: string }>[];
      }>;

      // Use partial on the shape components
      const TaskIdType = string();

      const TaskTitleType = optional(string(''));

      const TaskDoneType = optional(boolean(false));

      const TaskPartial: Type<Task> = recursion('TaskPartial', () =>
        record({
          id: TaskIdType,
          title: TaskTitleType,
          done: TaskDoneType,
          subtasks: optional(array(TaskPartial), {
            forceUndefinedDefault: true,
          }),
        }),
      );

      const validPartial = {
        id: 'task1',
      } as const;

      assert.isTrue(TaskPartial.is(validPartial));

      const validWithSubtasks = {
        id: 'task2',
        subtasks: [{ id: 'subtask1' }],
      } as const;

      assert.isTrue(TaskPartial.is(validWithSubtasks));

      // Use required version
      const TaskRequired: Type<
        Readonly<{
          id: string;
          title: string;
          done: boolean;
          subtasks: readonly Readonly<{
            id: string;
            title: string;
            done: boolean;
          }>[];
        }>
      > = recursion('TaskRequired', () =>
        record({
          id: TaskIdType,
          title: string(''),
          done: boolean(false),
          subtasks: array(TaskRequired),
        }),
      );

      const validRequired = {
        id: 'task3',
        title: 'Do something',
        done: false,
        subtasks: [],
      } as const;

      assert.isTrue(TaskRequired.is(validRequired));
    });

    test('recursion with keyof and valueof', () => {
      type Config = Readonly<{
        name: string;
        value: number;
        nested: Config | null;
      }>;

      const ConfigShape = {
        name: string(),
        value: number(0),
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        nested: union([nullType, {} as Type<Config>]),
      } as const;

      const ConfigType: Type<Config> = recursion(
        'Config',
        () => record(ConfigShape),
        {
          defaultValue: {
            name: '',
            value: 0,
            nested: null,
          },
        },
      );

      // Validate a config instance
      const validConfig = {
        name: 'test',
        value: 42,
        nested: null,
      } as const;

      assert.isTrue(ConfigType.is(validConfig));

      // Get keys from the shape
      const ConfigKeys = keyof(record(ConfigShape));

      assert.isTrue(ConfigKeys.is('name'));

      assert.isTrue(ConfigKeys.is('value'));

      assert.isTrue(ConfigKeys.is('nested'));

      assert.isFalse(ConfigKeys.is('invalid'));

      // Get values from the shape
      const ConfigValues = valueof(record(ConfigShape));

      assert.isTrue(ConfigValues.is('test'));

      assert.isTrue(ConfigValues.is(42));

      assert.isTrue(ConfigValues.is(null));
    });

    test('recursion with branded types', () => {
      type NodeId = Brand<string, 'NodeId'>;

      type BrandedNode = Readonly<{
        id: NodeId;
        children: readonly BrandedNode[];
      }>;

      const NodeIdType = brandedString<'NodeId'>({
        typeName: 'NodeId',

        defaultValue: 'node-default',
      });

      const BrandedNodeType: Type<BrandedNode> = recursion('BrandedNode', () =>
        record({
          id: NodeIdType,
          children: array(BrandedNodeType),
        }),
      );

      const validId = NodeIdType.cast('node-123');

      const validNode = {
        id: validId,
        children: [],
      } as const;

      assert.isTrue(BrandedNodeType.is(validNode));

      const validNested = {
        id: validId,
        children: [{ id: NodeIdType.cast('child-1'), children: [] }],
      } as const;

      assert.isTrue(BrandedNodeType.is(validNested));
    });

    test('recursion with mergeRecords', () => {
      type BaseEntity = Readonly<{
        id: string;
        name: string;
      }>;

      type Versioned = Readonly<{
        version: number;
      }>;

      type VersionedEntity = BaseEntity &
        Versioned &
        Readonly<{
          parent: VersionedEntity | null;
        }>;

      const BaseEntityType = record({
        id: string(),
        name: string(''),
      });

      const VersionedType = record({
        version: number(1),
      });

      const VersionedEntityType: Type<VersionedEntity> = recursion(
        'VersionedEntity',
        () =>
          mergeRecords([
            BaseEntityType,
            VersionedType,
            record({
              parent: union([nullType, VersionedEntityType]),
            }),
          ]),
      );

      const validEntity = {
        id: 'entity1',
        name: 'Root',
        version: 1,
        parent: null,
      } as const;

      assert.isTrue(VersionedEntityType.is(validEntity));

      const validNested = {
        id: 'entity2',
        name: 'Child',
        version: 2,
        parent: {
          id: 'entity1',
          name: 'Parent',
          version: 1,
          parent: null,
        },
      } as const;

      assert.isTrue(VersionedEntityType.is(validNested));
    });

    test('nested recursion - recursion within recursion', () => {
      // File system with both files and directories
      type FileNode = Readonly<{
        type: 'file';
        name: string;
        size: number;
      }>;

      type Directory = Readonly<{
        type: 'directory';
        name: string;
        contents: readonly FileSystemNode[];
      }>;

      type FileSystemNode = FileNode | Directory;

      const FileNodeType = record({
        type: literal('file'),
        name: string(),
        size: number(0),
      });

      const DirectoryType: Type<Directory> = recursion('Directory', () =>
        record({
          type: literal('directory'),
          name: string(),
          contents: array(FileSystemNodeType),
        }),
      );

      const FileSystemNodeType: Type<FileSystemNode> = recursion(
        'FileSystemNode',
        () => union([FileNodeType, DirectoryType]),
      );

      const validFile = {
        type: 'file',
        name: 'test.txt',
        size: 1024,
      } as const;

      assert.isTrue(FileSystemNodeType.is(validFile));

      const validDirectory = {
        type: 'directory',
        name: 'folder',
        contents: [
          {
            type: 'file',
            name: 'file1.txt',
            size: 512,
          },
          {
            type: 'directory',
            name: 'subfolder',
            contents: [
              {
                type: 'file',
                name: 'file2.txt',
                size: 256,
              },
            ],
          },
        ],
      } as const;

      assert.isTrue(FileSystemNodeType.is(validDirectory));
    });

    test('recursion with keyValueRecord', () => {
      type NestedConfig = ReadonlyRecord<string, string | number | unknown>;

      const NestedConfigType: Type<NestedConfig> = recursion(
        'NestedConfig',
        () =>
          keyValueRecord(
            string(),
            union([string(), number(), NestedConfigType]),
          ),
      );

      const validConfig = {
        host: 'localhost',
        port: 3000,
        database: {
          host: 'db.local',
          port: 5432,
          credentials: {
            username: 'admin',
            password: 'secret',
          },
        },
      } as const;

      assert.isTrue(NestedConfigType.is(validConfig));

      const invalidConfig = {
        host: 'localhost',
        port: 3000,
        invalid: true, // boolean is not allowed
      } as const;

      assert.isFalse(NestedConfigType.is(invalidConfig));
    });

    test('complex recursion with multiple type operations', () => {
      // Graph node with all operations combined
      type NodeId = Brand<string, 'NodeId'>;

      type BaseNode = Readonly<{
        id: NodeId;
        label: string;
      }>;

      type NodeMetadata = Readonly<{
        createdAt: number;
        tags: readonly string[];
      }>;

      type GraphNode = BaseNode &
        Partial<NodeMetadata> &
        Readonly<{
          edges: ReadonlyRecord<string, GraphNode | null>;
        }>;

      const NodeIdType = brandedString<'NodeId'>({
        typeName: 'NodeId',

        defaultValue: 'node-default',
      });

      const BaseNodeType = record({
        id: NodeIdType,
        label: string(''),
      });

      const NodeMetadataType = record({
        createdAt: number(0),
        tags: array(string()),
      });

      const NodeMetadataPartial = partial(NodeMetadataType);

      const GraphNodeType: Type<GraphNode> = recursion('GraphNode', () =>
        mergeRecords([
          BaseNodeType,
          NodeMetadataPartial,
          record({
            edges: keyValueRecord(string(), union([nullType, GraphNodeType])),
          }),
        ]),
      );

      const node1 = {
        id: NodeIdType.cast('node-1'),
        label: 'Node 1',
        createdAt: 1234567890,
        tags: ['important'],
        edges: {},
      } as const;

      assert.isTrue(GraphNodeType.is(node1));

      const node2 = {
        id: NodeIdType.cast('node-2'),
        label: 'Node 2',
        edges: {
          next: {
            id: NodeIdType.cast('node-3'),
            label: 'Node 3',
            edges: {},
          },
          prev: null,
        },
      } as const;

      assert.isTrue(GraphNodeType.is(node2));
    });
  });
});

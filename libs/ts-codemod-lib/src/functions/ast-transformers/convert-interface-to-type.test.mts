import dedent from 'dedent';
import { Project } from 'ts-morph';
import { convertInterfaceToTypeTransformer } from './convert-interface-to-type.mjs';

describe(convertInterfaceToTypeTransformer, () => {
  test('converts simple interface to type', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        interface User {
          name: string;
          age: number;
        }
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        type User = {
          name: string;
          age: number;
        };
      `,
    );
  });

  test('converts exported interface to exported type', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        export interface User {
          name: string;
          age: number;
        }
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        export type User = {
          name: string;
          age: number;
        };
      `,
    );
  });

  test('converts interface with type parameters', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        interface Container<T> {
          value: T;
        }
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        type Container<T> = {
          value: T;
        };
      `,
    );
  });

  test('converts interface with extends', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        interface Base {
          id: string;
        }

        interface User extends Base {
          name: string;
        }
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        type Base = {
          id: string;
        };

        type User = Base & {
          name: string;
        };
      `,
    );
  });

  test('converts interface extending multiple interfaces', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        interface A {
          a: string;
        }

        interface B {
          b: number;
        }

        interface C extends A, B {
          c: boolean;
        }
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        type A = {
          a: string;
        };

        type B = {
          b: number;
        };

        type C = A & B & {
          c: boolean;
        };
      `,
    );
  });

  test('converts interface with only extends and no own members', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        interface Base {
          id: string;
        }

        interface User extends Base {}
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        type Base = {
          id: string;
        };

        type User = Base;
      `,
    );
  });

  test('converts empty interface', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        interface Empty {}
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        type Empty = Record<string, never>;
      `,
    );
  });

  // TODO: Fix this test
  // eslint-disable-next-line vitest/warn-todo -- intentionally skipped until fixed
  test.todo('converts interface with JSDoc comment');

  test('converts interface inside namespace', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        namespace MyNamespace {
          export interface User {
            name: string;
          }
        }
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        namespace MyNamespace {
          export type User = {
              name: string;
            };
        }
      `,
    );
  });

  test('converts interface with optional properties', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        interface User {
          name: string;
          age?: number;
        }
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        type User = {
          name: string;
          age?: number;
        };
      `,
    );
  });

  test('converts interface with readonly properties', () => {
    const project = new Project({ useInMemoryFileSystem: true } as const);

    const sourceFile = project.createSourceFile(
      'test.ts',
      dedent`
        interface User {
          readonly name: string;
          age: number;
        }
      `,
    );

    const transformer = convertInterfaceToTypeTransformer();

    transformer.transform(sourceFile);

    expect(sourceFile.getText()).toBe(
      dedent`
        type User = {
          readonly name: string;
          age: number;
        };
      `,
    );
  });
});

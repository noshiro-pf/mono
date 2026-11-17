import type { DomOp, DomValue } from 'split-view-link';
import { Arr } from 'ts-data-forge';

/**
 * A page, as `DomOp`s see it (`pane-bridge.mts` in `split-view-link`): the
 * steps the label picker takes, each answered asynchronously, with elements
 * named by handles.
 *
 * The same steps run on a page of this extension's own — in a tab, through a
 * `createDomExecutor` there — and on a page in a pane of Split View, which no
 * script of this extension can reach and which Split View runs them on instead.
 * So the picker is written once, against this.
 */
export type PageDom = Readonly<{
  location: () => Promise<string>;
  query: (selector: string, within?: number) => Promise<number | undefined>;
  queryAll: (selector: string, within?: number) => Promise<readonly number[]>;
  closest: (handle: number, selector: string) => Promise<number | undefined>;
  parent: (handle: number) => Promise<number | undefined>;
  attribute: (
    handle: number,
    attributeName: string,
  ) => Promise<string | undefined>;
  text: (handle: number) => Promise<string>;
  tagName: (handle: number) => Promise<string | undefined>;
  isOpen: (handle: number) => Promise<boolean>;
  click: (handle: number) => Promise<void>;
  input: (handle: number, value: string) => Promise<void>;
  key: (handle: number, key: string) => Promise<void>;
}>;

/**
 * A `PageDom` whose steps `run` carries out. What `run` answers is read as
 * untrusted: anything of the wrong type is taken for "nothing there".
 */
export const pageDomOver = (
  run: (op: DomOp) => DomValue | Promise<unknown>,
): PageDom => {
  const handleOf = async (op: DomOp): Promise<number | undefined> => {
    const answer: unknown = await run(op);

    return typeof answer === 'number' ? answer : undefined;
  };

  const stringOf = async (op: DomOp): Promise<string | undefined> => {
    const answer: unknown = await run(op);

    return typeof answer === 'string' ? answer : undefined;
  };

  return {
    location: async () => (await stringOf({ op: 'location' })) ?? '',
    query: async (selector, within) =>
      handleOf({ op: 'query', selector, within }),
    queryAll: async (selector, within) => {
      const answer: unknown = await run({ op: 'queryAll', selector, within });

      return Arr.isArray(answer)
        ? answer.filter(
            (handle): handle is number => typeof handle === 'number',
          )
        : [];
    },
    closest: async (handle, selector) =>
      handleOf({ op: 'closest', handle, selector }),
    parent: async (handle) => handleOf({ op: 'parent', handle }),
    attribute: async (handle, attributeName) =>
      stringOf({ op: 'attribute', handle, name: attributeName }),
    text: async (handle) => (await stringOf({ op: 'text', handle })) ?? '',
    tagName: async (handle) => stringOf({ op: 'tagName', handle }),
    isOpen: async (handle) => (await run({ op: 'isOpen', handle })) === true,
    click: async (handle) => {
      await run({ op: 'click', handle });
    },
    input: async (handle, value) => {
      await run({ op: 'input', handle, value });
    },
    key: async (handle, key) => {
      await run({ op: 'key', handle, key });
    },
  };
};

/**
 * `value` as a CSS string, quoted, for an attribute selector:
 * `[data-label-name=${cssStringOf(name)}]`. `CSS.escape` would do, but a
 * service worker has no `CSS`.
 */
export const cssStringOf = (value: string): string =>
  `"${value.replaceAll(/["\\]/gu, String.raw`\$&`).replaceAll('\n', String.raw`\a `)}"` as const;

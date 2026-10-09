/**
 * ELK, loaded when the DAG is first shown rather than with the page: the
 * bundled build is most of a megabyte, and the list view does not need it.
 *
 * The bundled build runs the layout on the main thread behind a promise. The
 * graphs of one person's tasks are small enough for that; a worker can come
 * later if they are not.
 */

import { castDeepMutable } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
// eslint-disable-next-line import-x/no-internal-modules, import-x/extensions -- elkjs has no `exports` map, and its browser build is reachable only by this path (`main` is the Node build).
import type * as ElkApi from 'elkjs/lib/elk.bundled.js';

export type ElkNode = ElkApi.ElkNode;

export type ElkExtendedEdge = ElkApi.ElkExtendedEdge;

export type ElkLabel = ElkApi.ElkLabel;

/** `graph` laid out. The first call loads ELK. */
export const layoutWithElk = async (
  graph: DeepReadonly<ElkNode>,
): Promise<ElkNode> => {
  const elk = await getElk();

  // A copy, because ELK writes its results into the graph it is given.
  return elk.layout(structuredClone(castDeepMutable(graph)));
};

type ElkInstance = Readonly<{
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ELK's own signature, which takes a mutable graph.
  layout: (graph: ElkNode) => Promise<ElkNode>;
}>;

const loadElk = async (): Promise<ElkInstance> => {
  // eslint-disable-next-line import-x/no-internal-modules, import-x/extensions -- See the import above.
  const module = await import('elkjs/lib/elk.bundled.js');

  // The file is CommonJS whose declaration says `export default`, so the
  // constructor is the default of the default as TypeScript sees it. At run
  // time the two are the same function: the build sets `default` on itself.
  const ElkConstructor = module.default.default;

  return new ElkConstructor();
};

/** Loads ELK once, on the first call, and hands every call the same one. */
const lazily = <T,>(load: () => Promise<T>): (() => Promise<T>) => {
  let mut_loaded: Promise<T> | undefined = undefined;

  return () => {
    mut_loaded ??= load();

    return mut_loaded;
  };
};

const getElk = lazily(loadElk);

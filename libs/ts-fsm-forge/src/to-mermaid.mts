import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { edgeTargets } from './internal/index.mjs';

/**
 * Draws a transition graph as a Mermaid `stateDiagram-v2`.
 *
 * Each state is declared once under a generated id (`s0`, `s1`, … in the order
 * a state type first appears: the graph's keys, then targets it does not list,
 * then `initial`), so a state type may contain characters an id cannot, such as
 * `.`. An edge with several targets is drawn once per distinct target, labelled
 * with its action type. In a label, `"` and `;` are written as Mermaid entity
 * codes and a line break as a space, so that each stays on its line.
 *
 * @param graph A graph as {@link defineMachine} takes it, a machine's `graph`,
 *   or one assembled at run time, whose targets may be any non-empty array. A
 *   target naming a state type the graph does not list is declared all the
 *   same.
 * @param options `initial`, the state type to draw an arrow from `[*]` to.
 * @returns The diagram's source, without a trailing newline.
 * @throws {TypeError} For an edge with no target (an empty array, or
 *   `undefined`), or with a target that is not a string or an array of them,
 *   which {@link defineMachine} rejects too.
 */
export const toMermaid = (
  graph: ReadonlyRecord<
    string,
    Partial<ReadonlyRecord<string, string | readonly string[]>>
  >,
  options?: Readonly<{ initial?: string }>,
): string => {
  const mut_ids = new Map<string, string>();

  // Gives each state type its id the first time it is seen.
  const idOf = (stateType: string): string => {
    const known = mut_ids.get(stateType);

    if (known !== undefined) {
      return known;
    }

    const id = `s${mut_ids.size}` as const;

    mut_ids.set(stateType, id);

    return id;
  };

  for (const stateType of Object.keys(graph)) {
    idOf(stateType);
  }

  const transitions = Object.entries(graph).flatMap(([from, row]) =>
    Object.entries(row).flatMap(([actionType, target]) =>
      Arr.uniq(edgeTargets(from, actionType, target)).map(
        (to) => `  ${idOf(from)} --> ${idOf(to)}: ${label(actionType)}`,
      ),
    ),
  );

  const initial =
    options?.initial === undefined
      ? ([] as const)
      : ([`  [*] --> ${idOf(options.initial)}`] as const);

  return [
    'stateDiagram-v2',
    ...Array.from(
      mut_ids,
      ([stateType, id]) => `  state "${label(stateType)}" as ${id}`,
    ),
    ...initial,
    ...transitions,
  ].join('\n');
};

const label = (text: string): string =>
  text
    // `;` first: the entity codes end with one.
    .replaceAll(';', '#59;')
    .replaceAll('"', '#quot;')
    .replaceAll(/[\n\r]+/gu, ' ');

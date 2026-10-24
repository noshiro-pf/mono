import { Arr } from 'ts-data-forge';
import {
  byCount,
  freezeStates,
  initialStates,
  latestValue,
  list,
  type CodeLine,
  type EdgeHighlight,
  type Frame,
  type MutableNodeState,
  type Trace,
} from './frame.mjs';
import type { LocalizedText, Scenario, ScenarioNode } from './scenario.mjs';

/**
 * Runs the scenario through a model of RxJS's push propagation: a node that
 * emits calls each child's update right away, in the order the children
 * subscribed, so the graph is walked depth first and a node with two parents
 * runs once per parent, the first time with the other parent's old value.
 *
 * Only the first input is shown step by step; the rest are run at once and
 * shown in a final frame.
 */
export const simulateRxjs = (scenario: Scenario): Trace =>
  ({
    label: 'RxJS: depth-first propagation',
    scenario,
    code: codeLines,
    showTokens: false,
    legend: ['emitted', 'visiting', 'glitch'],
    frames: framesOf(scenario),
  }) as const;

const framesOf = (scenario: Scenario): readonly Frame[] => {
  const source = scenario.nodes[0];

  const [firstInput, ...restInputs] = scenario.inputs;

  if (source === undefined || firstInput === undefined) {
    return [];
  }

  const nodeById = new Map(scenario.nodes.map((n) => [n.id, n]));

  const childrenOf = (id: string): readonly ScenarioNode[] =>
    scenario.nodes.filter((n) => n.parents.includes(id));

  const mut_states = initialStates(scenario);

  const mut_frames: Frame[] = [];

  const snapshot = (
    rest: Readonly<{
      calls: readonly Call[];
      activeNode?: string;
      code: readonly CodeLineId[];
      caption: LocalizedText;
    }>,
  ): void => {
    mut_frames.push({
      update: 0,
      nodes: freezeStates(mut_states),
      panel: { type: 'callStack', calls: rest.calls.map((c) => c.text) },
      activeNode: rest.activeNode,
      edges: callPath(rest.calls),
      code: rest.code,
      caption: rest.caption,
    });
  };

  /**
   * Emits `value` from `nodeId` and, unless `silent`, records the calls it
   * makes. Returns nothing: the states are updated in place.
   */
  const emit = (
    nodeId: string,
    value: number,
    finalValues: ReadonlyMap<string, number>,
    calls: readonly Call[],
    silent: boolean,
  ): void => {
    const mut_state = mut_states.get(nodeId);

    if (mut_state === undefined) {
      return;
    }

    mut_state.history.push({
      value,
      glitch: value !== finalValues.get(nodeId),
    });

    mut_state.status = 'emitted';

    for (const [i, child] of childrenOf(nodeId).entries()) {
      const evaluate = nodeById.get(child.id)?.evaluate;

      if (evaluate === undefined) {
        continue;
      }

      const parentValues = child.parents.map((p) =>
        latestValue(mut_states.get(p)),
      );

      const evaluation = evaluate(parentValues);

      if (evaluation.type === 'skip') {
        continue;
      }

      const childCalls = Arr.toPushed(calls, {
        node: child.id,
        text: `${child.id}.update()`,
      });

      const mut_childState = mut_states.get(child.id);

      if (mut_childState !== undefined) {
        mut_childState.status = 'visiting';
      }

      if (!silent) {
        visitFrame({
          parent: nodeId,
          child,
          isFirstChild: i === 0,
          calls: childCalls,
          stale: child.parents.filter(
            (p) => latestValue(mut_states.get(p)) !== finalValues.get(p),
          ),
        });
      }

      const nextCalls = Arr.toPushed(childCalls, {
        node: child.id,
        text: `${child.id}.next(${evaluation.value.toString()})`,
      });

      const glitch = evaluation.value !== finalValues.get(child.id);

      if (!silent) {
        // The frame shows the value already stored.
        mut_childState?.history.push({ value: evaluation.value, glitch });

        if (mut_childState !== undefined) {
          mut_childState.status = 'emitted';
        }

        snapshot({
          calls: nextCalls,
          activeNode: child.id,
          code: ['updateDef', 'compute', 'emit', 'nextDef', 'store'],
          caption: emitCaption({
            node: child.id,
            formula: evaluation.formula,
            value: evaluation.value,
            glitch,
            stale: child.parents.filter(
              (p) => latestValue(mut_states.get(p)) !== finalValues.get(p),
            ),
            children: childrenOf(child.id).map((c) => c.id),
          }),
        });

        mut_childState?.history.pop();
      }

      emit(child.id, evaluation.value, finalValues, nextCalls, silent);
    }
  };

  const visitFrame = ({
    parent,
    child,
    isFirstChild,
    calls,
    stale,
  }: Readonly<{
    parent: string;
    child: ScenarioNode;
    isFirstChild: boolean;
    calls: readonly Call[];
    stale: readonly string[];
  }>): void => {
    const others = child.parents.filter((p) => p !== parent);

    const call: LocalizedText = isFirstChild
      ? ({
          en: `${parent} calls ${child.id}.update() right away, before ${parent}.next() returns.`,
          ja: `${parent} は ${parent}.next() から戻る前に、すぐ ${child.id}.update() を呼びます。`,
        } as const)
      : ({
          en: `The calls below ${parent} have returned, and ${parent}.next() moves on to its next child: ${child.id}.update().`,
          ja: `${parent} から先の呼び出しが戻り、${parent}.next() は次の子の ${child.id}.update() に進みます。`,
        } as const);

    snapshot({
      calls,
      activeNode: child.id,
      code: ['nextDef', 'forChildren', 'callUpdate'],
      caption: {
        en: `${call.en}${Arr.isNonEmpty(stale) ? ` ${child.id} also depends on ${list(stale, 'en')}, which ${byCount(stale, 'has', 'have')} not run yet.` : Arr.isNonEmpty(others) ? ` ${list(others, 'en')} ${byCount(others, 'has', 'have')} already run, so this time ${child.id} sees only new values.` : ''}`,
        ja: `${call.ja}${Arr.isNonEmpty(stale) ? `${child.id} は ${list(stale, 'ja')} にも依存していますが、そちらはまだ実行されていません。` : Arr.isNonEmpty(others) ? `${list(others, 'ja')} はすでに実行済みなので、今回 ${child.id} が見るのは新しい値だけです。` : ''}`,
      },
    });
  };

  snapshot({
    calls: [],
    code: [],
    caption: {
      en: `Every node holds ${scenario.initialValue.toString()}. ${source.id} is about to emit ${firstInput.toString()}.`,
      ja: `どのノードも ${scenario.initialValue.toString()} を持っています。これから ${source.id} が ${firstInput.toString()} を発行します。`,
    },
  });

  const run = (input: number, silent: boolean): void => {
    for (const mut_s of mut_states.values()) {
      mut_s.status = 'idle';
    }

    const finalValues = consistentValues(scenario, mut_states, input);

    const calls = [
      { node: source.id, text: `${source.id}.next(${input.toString()})` },
    ] as const;

    if (!silent) {
      const mut_sourceState = mut_states.get(source.id);

      mut_sourceState?.history.push({ value: input, glitch: false });

      if (mut_sourceState !== undefined) {
        mut_sourceState.status = 'emitted';
      }

      snapshot({
        calls,
        activeNode: source.id,
        code: ['sourceNext', 'nextDef', 'store'],
        caption: {
          en: `${source.id}.next(${input.toString()}): ${source.id} stores ${input.toString()} and then calls update() on each child in turn, in the order they subscribed: ${list(
            childrenOf(source.id).map((c) => c.id),
            'en',
          )}.`,
          ja: `${source.id}.next(${input.toString()})：${source.id} は ${input.toString()} を書き込み、子の update() を購読した順に一つずつ呼びます（${list(
            childrenOf(source.id).map((c) => c.id),
            'ja',
          )}）。`,
        },
      });

      mut_sourceState?.history.pop();
    }

    emit(source.id, input, finalValues, calls, silent);
  };

  run(firstInput, false);

  const twice = scenario.nodes
    .filter(
      (n) =>
        (mut_states.get(n.id)?.history.filter((h) => h.glitch).length ?? 0) > 0,
    )
    .map((n) => n.id);

  snapshot({
    calls: [],
    code: [],
    caption: {
      en: `Every call has returned. ${list(twice, 'en')} ran once for each parent, and the first time emitted a value no consistent state has: a glitch, in red.`,
      ja: `すべての呼び出しが戻りました。${list(twice, 'ja')} は親ごとに一度ずつ実行され、一度目は整合しない値を発行しました。赤で示したのがグリッチです。`,
    },
  });

  for (const input of restInputs) {
    run(input, true);
  }

  if (Arr.isNonEmpty(restInputs)) {
    snapshot({
      calls: [],
      code: [],
      caption: {
        en: `The same happens for ${list(
          restInputs.map((n) => n.toString()),
          'en',
        )}: every update of ${source.id} makes ${list(twice, 'en')} emit twice, and the first of the two is a glitch.`,
        ja: `${list(
          restInputs.map((n) => n.toString()),
          'ja',
        )} でも同じことが起こります。${source.id} が更新されるたびに ${list(twice, 'ja')} は二度発行し、そのうち一度目がグリッチです。`,
      },
    });
  }

  return mut_frames;
};

type Call = Readonly<{ node: string; text: string }>;

const codeLines = [
  ['sourceNext', 'A.next(input)'],
  ['blank1', ''],
  ['nextDef', 'next(value):'],
  ['store', '  this.value = value'],
  ['forChildren', '  for (child of this.children)'],
  ['callUpdate', '    child.update()  // right now, depth first'],
  ['blank2', ''],
  ['updateDef', 'update():'],
  ['compute', '  result = compute(parents)'],
  ['emit', '  this.next(result)'],
] as const satisfies readonly CodeLine[];

type CodeLineId = (typeof codeLines)[number][0];

/** The edges from each call on the stack to the node it calls into. */
const callPath = (calls: readonly Call[]): readonly EdgeHighlight[] =>
  calls.flatMap((c, i) => {
    const next = calls[i + 1];

    return next === undefined || next.node === c.node
      ? []
      : [{ from: c.node, to: next.node, kind: 'call' } as const];
  });

/** What every node holds once the update with `input` has settled. */
const consistentValues = (
  scenario: Scenario,
  states: ReadonlyMap<string, MutableNodeState>,
  input: number,
): ReadonlyMap<string, number> => {
  const mut_values = new Map<string, number>(
    Array.from(states, ([id, s]) => [id, latestValue(s)]),
  );

  const [source, ...rest] = scenario.nodes;

  if (source !== undefined) {
    mut_values.set(source.id, input);
  }

  // `nodes` is in creation order, which is a topological order.
  for (const node of rest) {
    const evaluation = node.evaluate?.(
      node.parents.map((p) => mut_values.get(p) ?? 0),
    );

    if (evaluation?.type === 'emit') {
      mut_values.set(node.id, evaluation.value);
    }
  }

  return mut_values;
};

const emitCaption = ({
  node,
  formula,
  value,
  glitch,
  stale,
  children,
}: Readonly<{
  node: string;
  formula: string;
  value: number;
  glitch: boolean;
  stale: readonly string[];
  children: readonly string[];
}>): LocalizedText => {
  const head: LocalizedText = {
    en: `${node} computes ${formula} and calls ${node}.next(${value.toString()}).`,
    ja: `${node} は ${formula} を計算し、${node}.next(${value.toString()}) を呼びます。`,
  } as const;

  const glitchText: LocalizedText = glitch
    ? ({
        en: ` ${list(stale, 'en')} still ${byCount(stale, 'holds its', 'hold their')} old value, so ${value.toString()} is a glitch: its subscribers see a value that no consistent state has.`,
        ja: `${list(stale, 'ja')} はまだ古い値のままなので、${value.toString()} はグリッチです。購読者は、どの整合した状態にも存在しない値を受け取ります。`,
      } as const)
    : ({ en: '', ja: '' } as const);

  const childrenText: LocalizedText = Arr.isNonEmpty(children)
    ? ({
        en: ` Next it calls ${list(
          children.map((c) => `${c}.update()`),
          'en',
        )}.`,
        ja: `続いて ${list(
          children.map((c) => `${c}.update()`),
          'ja',
        )} を呼びます。`,
      } as const)
    : ({
        en: ` ${node} has no children, so the call returns.`,
        ja: `${node} に子はないので、呼び出しは戻ります。`,
      } as const);

  return {
    en: `${head.en}${glitchText.en}${childrenText.en}`,
    ja: `${head.ja}${glitchText.ja}${childrenText.ja}`,
  };
};

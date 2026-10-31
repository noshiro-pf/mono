import { Arr } from 'ts-data-forge';
import type { LocalizedText } from '../constants.mjs';
import {
  byCount,
  freezeStates,
  initialStates,
  latestValue,
  list,
  type Chip,
  type CodeLine,
  type EdgeHighlight,
  type Frame,
  type Trace,
} from './frame.mjs';
import type { Scenario, ScenarioNode } from './scenario.mjs';

/**
 * Runs the scenario through a model of the priority queue approach of
 * Scala.React: a node that emits enqueues its children by level (its depth),
 * and the loop dequeues the lowest level first, so a node runs only after
 * all its parents. Each enqueue and dequeue costs O(log n).
 */
export const simulatePriorityQueue = (scenario: Scenario): Trace =>
  ({
    label: 'Priority queue: propagation in ascending level order',
    scenario,
    code: codeLines,
    showTokens: false,
    legend: ['emitted', 'visiting', 'queued'],
    frames: framesOf(scenario),
  }) as const;

const enqueueEdges = (
  from: string,
  result: EnqueueResult,
): readonly EdgeHighlight[] =>
  [
    ...result.added.map((to) => ({ from, to, kind: 'queue' }) as const),
    ...result.already.map((to) => ({ from, to, kind: 'already' }) as const),
  ] as const;

const emitCaption = (
  node: string,
  formula: string,
  queued: EnqueueResult,
): LocalizedText => {
  const added: LocalizedText = Arr.isEmpty(queued.added)
    ? ({ en: '', ja: '' } as const)
    : ({
        en: ` It enqueues ${list(queued.added, 'en')}.`,
        ja: `${list(queued.added, 'ja')} をキューに入れます。`,
      } as const);

  const already: LocalizedText = Arr.isEmpty(queued.already)
    ? ({ en: '', ja: '' } as const)
    : ({
        en: ` ${list(queued.already, 'en')} ${byCount(queued.already, 'is', 'are')} already in the queue, so ${byCount(queued.already, 'it is', 'they are')} not enqueued again.`,
        ja: `${list(queued.already, 'ja')} はすでにキューにあるので、もう一度は入れません。`,
      } as const);

  const none: LocalizedText =
    Arr.isEmpty(queued.added) && Arr.isEmpty(queued.already)
      ? ({
          en: ` ${node} has no children.`,
          ja: `${node} に子はありません。`,
        } as const)
      : ({ en: '', ja: '' } as const);

  return {
    en: `${node} computes ${formula}.${added.en}${already.en}${none.en}`,
    ja: `${node} は ${formula} を計算します。${added.ja}${already.ja}${none.ja}`,
  };
};

const framesOf = (scenario: Scenario): readonly Frame[] => {
  const source = scenario.nodes[0];

  if (source === undefined) {
    return [];
  }

  const nodeById = new Map(scenario.nodes.map((n) => [n.id, n]));

  const childrenOf = (id: string): readonly ScenarioNode[] =>
    scenario.nodes.filter((n) => n.parents.includes(id));

  const levelOf = (id: string): number => nodeById.get(id)?.depth ?? 0;

  const mut_states = initialStates(scenario);

  const mut_frames: Frame[] = [];

  /** Kept sorted by level, then by the order nodes were enqueued. */
  const mut_queue: QueuedNode[] = [];

  const snapshot = (
    rest: Readonly<{
      activeNode?: string;
      leaving?: QueuedNode;
      edges?: readonly EdgeHighlight[];
      code: readonly CodeLineId[];
      caption: LocalizedText;
    }>,
  ): void => {
    const chips: readonly Chip[] = [
      ...mut_queue.map((q, slot) => ({
        key: q.node,
        node: q.node,
        from: q.from,
        lane: 0,
        slot,
        leaving: false,
        note: `L${levelOf(q.node).toString()}`,
      })),
      ...(rest.leaving === undefined
        ? ([] as const)
        : ([
            {
              key: rest.leaving.node,
              node: rest.leaving.node,
              from: rest.leaving.from,
              lane: 0,
              slot: 0,
              leaving: true,
              note: `L${levelOf(rest.leaving.node).toString()}`,
            },
          ] as const)),
    ] as const;

    mut_frames.push({
      update: 0,
      nodes: freezeStates(mut_states),
      panel: { type: 'priorityQueue', chips },
      activeNode: rest.activeNode,
      edges: rest.edges ?? [],
      code: rest.code,
      caption: rest.caption,
    });
  };

  /** Enqueues the children of `parent` and says what happened to each. */
  const enqueueChildren = (parent: string): EnqueueResult => {
    const mut_added: string[] = [];

    const mut_already: string[] = [];

    for (const child of childrenOf(parent)) {
      if (mut_queue.some((q) => q.node === child.id)) {
        mut_already.push(child.id);
      } else {
        const at = mut_queue.findIndex((q) => levelOf(q.node) > child.depth);

        mut_queue.splice(at === -1 ? mut_queue.length : at, 0, {
          node: child.id,
          from: parent,
        });

        mut_added.push(child.id);
      }
    }

    return { added: mut_added, already: mut_already };
  };

  snapshot({
    code: [],
    caption: {
      en: `Every node holds ${scenario.initialValue.toString()} and has a level, the length of the longest path from the source: ${scenario.nodes
        .map((n) => `${n.id} ${n.depth.toString()}`)
        .join(', ')}.`,
      ja: `どのノードも ${scenario.initialValue.toString()} を持ち、ソースからの最長経路の長さであるレベルを持っています（${scenario.nodes
        .map((n) => `${n.id} は ${n.depth.toString()}`)
        .join('、')}）。`,
    },
  });

  for (const input of scenario.inputs) {
    for (const mut_s of mut_states.values()) {
      mut_s.status = 'idle';
    }

    const mut_sourceState = mut_states.get(source.id);

    mut_sourceState?.history.push({ value: input, glitch: false });

    if (mut_sourceState !== undefined) {
      mut_sourceState.status = 'emitted';
    }

    const sourceQueued = enqueueChildren(source.id);

    snapshot({
      activeNode: source.id,
      edges: enqueueEdges(source.id, sourceQueued),
      code: ['sourceNext', 'nextDef', 'store', 'forChildren', 'enqueue'],
      caption: {
        en: `${source.id}.next(${input.toString()}): ${source.id} stores ${input.toString()} and enqueues its children ${list(sourceQueued.added, 'en')} by level. Each enqueue costs O(log n).`,
        ja: `${source.id}.next(${input.toString()})：${source.id} は ${input.toString()} を書き込み、子 ${list(sourceQueued.added, 'ja')} をレベル順にキューへ入れます。一回の enqueue は O(log n) です。`,
      },
    });

    while (Arr.isNonEmpty(mut_queue)) {
      const [taken] = mut_queue;

      mut_queue.shift();

      const node = nodeById.get(taken.node);

      const mut_state = mut_states.get(taken.node);

      if (mut_state === undefined || node?.evaluate === undefined) {
        continue;
      }

      mut_state.status = 'visiting';

      snapshot({
        activeNode: node.id,
        leaving: taken,
        code: ['while', 'dequeue', 'update', 'updateDef'],
        caption: {
          en: `Dequeue the node with the lowest level: ${node.id} (level ${node.depth.toString()}), at a cost of O(log n). Every node of a lower level has already run, so all of ${node.id}'s parents are up to date.`,
          ja: `レベルが最も低いノード ${node.id}（レベル ${node.depth.toString()}）を取り出します。コストは O(log n) です。それより低いレベルのノードはすべて実行済みなので、${node.id} の親はすべて最新です。`,
        },
      });

      const evaluation = node.evaluate(
        node.parents.map((p) => latestValue(mut_states.get(p))),
      );

      if (evaluation.type === 'skip') {
        mut_state.status = 'skipped';

        continue;
      }

      mut_state.history.push({ value: evaluation.value, glitch: false });

      mut_state.status = 'emitted';

      const queued = enqueueChildren(node.id);

      snapshot({
        activeNode: node.id,
        edges: enqueueEdges(node.id, queued),
        code: ['compute', 'emit', 'nextDef', 'store', 'forChildren', 'enqueue'],
        caption: emitCaption(node.id, evaluation.formula, queued),
      });
    }

    snapshot({
      code: [],
      caption: {
        en: 'The queue is empty and the update is over. Every node ran once, after all its parents, so no glitch was emitted; but each one cost an enqueue and a dequeue of O(log n).',
        ja: 'キューが空になり、更新は終わります。どのノードも親がすべて済んでから一度だけ実行されたので、グリッチは出ません。ただし、ノードごとに O(log n) の enqueue と dequeue がかかっています。',
      },
    });
  }

  return mut_frames;
};

type QueuedNode = Readonly<{ node: string; from: string }>;

type EnqueueResult = Readonly<{
  added: readonly string[];
  already: readonly string[];
}>;

const codeLines = [
  ['sourceNext', 'A.next(input)'],
  ['while', 'while (queue is not empty)'],
  ['dequeue', '  node = queue.dequeue()  // min level, O(log n)'],
  ['update', '  node.update()'],
  ['blank1', ''],
  ['nextDef', 'next(value):'],
  ['store', '  this.value = value'],
  ['forChildren', '  for (child of this.children)'],
  ['enqueue', '    if (child ∉ queue) queue.enqueue(child)  // O(log n)'],
  ['blank2', ''],
  ['updateDef', 'update():'],
  ['compute', '  result = compute(parents)'],
  ['emit', '  this.next(result)'],
] as const satisfies readonly CodeLine[];

type CodeLineId = (typeof codeLines)[number][0];

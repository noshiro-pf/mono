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
import type { Evaluation, Scenario, ScenarioNode } from './scenario.mjs';

/**
 * Runs the scenario's inputs through a model of synstate's propagation and
 * records one frame per step: an update opens its queue, the source emits,
 * each queued node is taken out and visited, and each visit either emits
 * (queueing the node's children) or skips.
 *
 * The model follows `libs/synstate/PROPAGATION.md`: one bucket per depth
 * below the manager, a child queued at most once per update however many of
 * its parents emit, buckets drained shallowest first, and a node that does
 * not emit queueing nothing.
 *
 * Without `tokens`, the update tokens are left out of the drawing, the code
 * and the captions, for a graph in which every node emits.
 */
export const simulateSynState = (
  scenario: Scenario,
  { tokens }: Readonly<{ tokens: boolean }>,
): Trace =>
  ({
    label: 'SynState: propagation through a queue bucketed by depth',
    scenario,
    code: tokens ? codeLines : codeLinesWithoutTokens,
    showTokens: tokens,
    legend: tokens
      ? (['emitted', 'visiting', 'skipped', 'queued'] as const)
      : (['emitted', 'visiting', 'queued'] as const),
    frames: framesOf(scenario, tokens),
  }) as const;

const framesOf = (scenario: Scenario, tokens: boolean): readonly Frame[] => {
  const source = scenario.nodes[0];

  if (source === undefined) {
    return [];
  }

  const nodeById = new Map(scenario.nodes.map((n) => [n.id, n]));

  const childrenOf = (id: string): readonly ScenarioNode[] =>
    scenario.nodes.filter((n) => n.parents.includes(id));

  const maxDepth = Math.max(...scenario.nodes.map((n) => n.depth));

  const mut_states = initialStates(scenario);

  const mut_frames: Frame[] = [];

  const snapshot = (
    update: number,
    queue: readonly (readonly QueuedNode[])[],
    rest: Readonly<{
      activeNode?: string;
      activeDepth?: number;
      leaving?: QueuedNode & Readonly<{ depth: number }>;
      edges?: readonly EdgeHighlight[];
      code: readonly CodeLineId[];
      caption: LocalizedText;
    }>,
  ): void => {
    const chips: readonly Chip[] = [
      ...queue.flatMap((bucket, depth) =>
        bucket.map((q, slot) => ({
          key: `${update.toString()}:${q.node}`,
          node: q.node,
          from: q.from,
          lane: depth,
          slot,
          leaving: false,
        })),
      ),
      ...(rest.leaving === undefined
        ? ([] as const)
        : ([
            {
              key: `${update.toString()}:${rest.leaving.node}`,
              node: rest.leaving.node,
              from: rest.leaving.from,
              lane: rest.leaving.depth,
              slot: 0,
              leaving: true,
            },
          ] as const)),
    ] as const;

    mut_frames.push({
      update,
      nodes: freezeStates(mut_states),
      panel: {
        type: 'buckets',
        maxDepth,
        activeDepth: rest.activeDepth,
        chips,
      },
      activeNode: rest.activeNode,
      edges: rest.edges ?? [],
      code: rest.code,
      caption: rest.caption,
    });
  };

  snapshot(0, [], {
    code: [],
    caption: tokens
      ? {
          en: 'Before the updates, every node holds the value of the initial update, t0.',
          ja: '更新の前は、どのノードも最初の更新 t0 の値を持っています。',
        }
      : {
          en: `Before the update, every node holds ${scenario.initialValue.toString()}.`,
          ja: `更新の前は、どのノードも ${scenario.initialValue.toString()} を持っています。`,
        },
  });

  for (const [index, input] of scenario.inputs.entries()) {
    const update = index + 1;

    const t = `t${update.toString()}` as const;

    /** The arguments of `setNext` as the code shows them. */
    const args = (value: number): string =>
      tokens ? (`${value.toString()}, ${t}` as const) : value.toString();

    for (const mut_s of mut_states.values()) {
      mut_s.status = 'idle';
    }

    const mut_queue: QueuedNode[][] = Array.from(
      { length: maxDepth + 1 },
      () => [],
    );

    const mut_queued = new Set<string>();

    /** Queues the children of `parent` and says what happened to each. */
    const enqueueChildren = (parent: string): EnqueueResult => {
      const mut_added: string[] = [];

      const mut_already: string[] = [];

      for (const child of childrenOf(parent)) {
        if (mut_queued.has(child.id)) {
          mut_already.push(child.id);
        } else {
          mut_queued.add(child.id);

          mut_queue[child.depth]?.push({ node: child.id, from: parent });

          mut_added.push(child.id);
        }
      }

      return { added: mut_added, already: mut_already };
    };

    snapshot(update, mut_queue, {
      activeNode: source.id,
      code: ['open'],
      caption: tokens
        ? {
            en: `${source.id} receives ${input.toString()}. openUpdate() starts update ${t}: the token ${t} is also this update's queue, with one bucket per depth below ${source.id}.`,
            ja: `${source.id} に ${input.toString()} が来ます。openUpdate() が更新 ${t} を始めます。トークン ${t} はこの更新のキューでもあり、${source.id} より深い深さごとにバケットを持ちます。`,
          }
        : {
            en: `${source.id} receives ${input.toString()}. openUpdate() opens the queue of this update, with one bucket per depth below ${source.id}.`,
            ja: `${source.id} に ${input.toString()} が来ます。openUpdate() がこの更新のキューを用意します。キューは ${source.id} より深い深さごとにバケットを持ちます。`,
          },
    });

    const mut_sourceState = mut_states.get(source.id);

    if (mut_sourceState !== undefined) {
      mut_sourceState.history.push({ value: input, glitch: false });

      mut_sourceState.token = update;

      mut_sourceState.status = 'emitted';
    }

    const sourceQueued = enqueueChildren(source.id);

    snapshot(update, mut_queue, {
      activeNode: source.id,
      edges: sourceQueued.added.map((to) => ({
        from: source.id,
        to,
        kind: 'queue',
      })),
      code: ['sourceSetNext', 'setNext', 'store', 'forChildren', 'push'],
      caption: {
        en: `${source.id}.setNext(${args(input)}): ${source.id} stores ${input.toString()}${tokens ? ` and ${t}` : ''}, then puts its children ${list(sourceQueued.added, 'en')} into the buckets of their depths.`,
        ja: `${source.id}.setNext(${args(input)})：${source.id} は ${input.toString()}${tokens ? ` と ${t}` : ''} を書き込み、子 ${list(sourceQueued.added, 'ja')} をそれぞれの深さのバケットに入れます。`,
      },
    });

    /** Takes one node out of the bucket of `depth` and visits it. */
    const visit = (taken: QueuedNode, depth: number): void => {
      const node = nodeById.get(taken.node);

      const mut_state = mut_states.get(taken.node);

      if (mut_state === undefined || node?.evaluate === undefined) {
        return;
      }

      const parentStates = node.parents.map((p) => ({
        id: p,
        state: mut_states.get(p),
      }));

      const emitted = parentStates.filter((p) => p.state?.token === update);

      const stale = parentStates.filter((p) => p.state?.token !== update);

      mut_state.status = 'visiting';

      snapshot(update, mut_queue, {
        activeNode: node.id,
        activeDepth: depth,
        leaving: { ...taken, depth },
        edges: tokens
          ? parentStates.map((p) => ({
              from: p.id,
              to: node.id,
              kind: p.state?.token === update ? 'emitted' : 'stale',
            }))
          : [],
        code: ['forDepths', 'forBucket', 'tryUpdate', 'tryUpdateDef', 'check'],
        caption: visitCaption({
          node: node.id,
          depth,
          t: tokens ? t : undefined,
          emitted: emitted.map((p) => p.id),
          stale: stale.map((p) => ({
            id: p.id,
            token: p.state?.token ?? 0,
          })),
        }),
      });

      const evaluation: Evaluation = node.evaluate(
        parentStates.map((p) => latestValue(p.state)),
      );

      if (evaluation.type === 'emit') {
        mut_state.history.push({ value: evaluation.value, glitch: false });

        mut_state.token = update;

        mut_state.status = 'emitted';

        const queued = enqueueChildren(node.id);

        snapshot(update, mut_queue, {
          activeNode: node.id,
          activeDepth: depth,
          edges: [
            ...queued.added.map((to) => ({
              from: node.id,
              to,
              kind: 'queue' as const,
            })),
            ...queued.already.map((to) => ({
              from: node.id,
              to,
              kind: 'already' as const,
            })),
          ],
          code: ['compute', 'emit', 'setNext', 'store', 'forChildren', 'push'],
          caption: emitCaption({
            node: node.id,
            formula: evaluation.formula,
            args: args(evaluation.value),
            t: tokens ? t : undefined,
            queued,
            childDepth: (id) => nodeById.get(id)?.depth ?? 0,
          }),
        });
      } else {
        mut_state.status = 'skipped';

        const children = childrenOf(node.id).map((c) => c.id);

        const queuedByOthers = children.filter((c) => mut_queued.has(c));

        const notQueued = children.filter((c) => !mut_queued.has(c));

        snapshot(update, mut_queue, {
          activeNode: node.id,
          activeDepth: depth,
          code: ['compute', 'emit'],
          caption: {
            en: [
              `${evaluation.reason.en} ${node.id} does not call setNext: it keeps t${mut_state.token.toString()} and queues none of its children.`,
              ...(Arr.isNonEmpty(queuedByOthers)
                ? [
                    `${list(queuedByOthers, 'en')} ${queuedByOthers.length === 1 ? 'is' : 'are'} in the queue already, put there by another parent.`,
                  ]
                : []),
              ...(Arr.isNonEmpty(notQueued)
                ? [
                    `${list(notQueued, 'en')} ${byCount(notQueued, 'stays', 'stay')} out of it.`,
                  ]
                : []),
            ].join(' '),
            ja: [
              `${evaluation.reason.ja}${node.id} は setNext を呼ばないので t${mut_state.token.toString()} のままで、子を一つもキューに入れません。`,
              ...(Arr.isNonEmpty(queuedByOthers)
                ? [
                    `${list(queuedByOthers, 'ja')} は別の親がすでにキューに入れています。`,
                  ]
                : []),
              ...(Arr.isNonEmpty(notQueued)
                ? [`${list(notQueued, 'ja')} はキューに入りません。`]
                : []),
            ].join(''),
          },
        });
      }
    };

    for (const depth of Array.from({ length: maxDepth }, (_, i) => i + 1)) {
      const mut_bucket = mut_queue[depth] ?? [];

      while (Arr.isNonEmpty(mut_bucket)) {
        const [taken] = mut_bucket;

        mut_bucket.shift();

        visit(taken, depth);
      }
    }

    const untouched = scenario.nodes
      .filter((n) => n.id !== source.id && !mut_queued.has(n.id))
      .map((n) => n.id);

    snapshot(update, mut_queue, {
      code: [],
      caption: {
        en: `Every bucket is empty, so ${tokens ? `update ${t}` : 'the update'} ends.${Arr.isNonEmpty(untouched) ? ` ${list(untouched, 'en')} ${byCount(untouched, 'was', 'were')} never queued, so the update did not even visit ${byCount(untouched, 'it', 'them')}.` : ' Each node was put in a bucket once and taken out once.'}`,
        ja: `バケットがすべて空になり、${tokens ? `更新 ${t}` : '更新'}は終わります。${Arr.isNonEmpty(untouched) ? `${list(untouched, 'ja')} は一度もキューに入らなかったので、この更新では訪問すらされていません。` : '各ノードはバケットに一度入り、一度出ただけです。'}`,
      },
    });
  }

  return mut_frames;
};

const codeLines = [
  ['open', 'token = openUpdate()'],
  ['sourceSetNext', 'A.setNext(input, token)'],
  ['forDepths', 'for (depth = 1; depth <= maxDepth; depth++)'],
  ['forBucket', '  for (node of token.bucket[depth])'],
  ['tryUpdate', '    node.tryUpdate(token)'],
  ['blank1', ''],
  ['tryUpdateDef', 'tryUpdate(token):'],
  ['check', '  which parents carry token?'],
  ['compute', '  result = compute(parents)'],
  ['emit', '  if (result is a value) this.setNext(result, token)'],
  ['blank2', ''],
  ['setNext', 'setNext(value, token):'],
  ['store', '  this.value = value; this.token = token'],
  ['forChildren', '  for (child of this.children)'],
  ['push', '    if (child ∉ token) token.bucket[child.depth].push(child)'],
] as const satisfies readonly CodeLine[];

const codeLinesWithoutTokens = [
  ['open', 'queue = openUpdate()'],
  ['sourceSetNext', 'A.setNext(input)'],
  ['forDepths', 'for (depth = 1; depth <= maxDepth; depth++)'],
  ['forBucket', '  for (node of queue.bucket[depth])'],
  ['tryUpdate', '    node.tryUpdate()'],
  ['blank1', ''],
  ['tryUpdateDef', 'tryUpdate():'],
  ['compute', '  result = compute(parents)'],
  ['emit', '  if (result is a value) this.setNext(result)'],
  ['blank2', ''],
  ['setNext', 'setNext(value):'],
  ['store', '  this.value = value'],
  ['forChildren', '  for (child of this.children)'],
  ['push', '    if (child ∉ queue) queue.bucket[child.depth].push(child)'],
] as const satisfies readonly CodeLine[];

type CodeLineId = (typeof codeLines)[number][0];

type QueuedNode = Readonly<{ node: string; from: string }>;

type EnqueueResult = Readonly<{
  added: readonly string[];
  already: readonly string[];
}>;

const visitCaption = ({
  node,
  depth,
  t,
  emitted,
  stale,
}: Readonly<{
  node: string;
  depth: number;
  /** Absent when the tokens are not shown. */
  t: string | undefined;
  emitted: readonly string[];
  stale: readonly Readonly<{ id: string; token: number }>[];
}>): LocalizedText => {
  const head: LocalizedText = {
    en: `Depth ${depth.toString()}: take ${node} out of its bucket and call ${node}.tryUpdate(${t ?? ''}).`,
    ja: `深さ ${depth.toString()}：${node} をバケットから取り出し、${node}.tryUpdate(${t ?? ''}) を呼びます。`,
  } as const;

  if (t === undefined) {
    return {
      en: `${head.en} Every parent of ${node} is shallower, so all of them have settled.`,
      ja: `${head.ja}${node} の親はすべてより浅いので、もう確定しています。`,
    };
  }

  const staleText: LocalizedText = {
    en: stale
      .map(
        (s) =>
          ` ${s.id} still carries t${s.token.toString()}: it did not emit in this update, so ${node} uses its last value.`,
      )
      .join(''),
    ja: stale
      .map(
        (s) =>
          `${s.id} は t${s.token.toString()} のままなので、この更新では発行しておらず、${node} はその最後の値を使います。`,
      )
      .join(''),
  } as const;

  return {
    en: `${head.en} ${list(emitted, 'en')} ${byCount(emitted, 'carries', 'carry')} ${t}, so ${byCount(emitted, 'it', 'they')} emitted in this update.${staleText.en}`,
    ja: `${head.ja}${list(emitted, 'ja')} は ${t} を持っているので、この更新で発行済みです。${staleText.ja}`,
  };
};

const emitCaption = ({
  node,
  formula,
  args,
  t,
  queued,
  childDepth,
}: Readonly<{
  node: string;
  formula: string;
  args: string;
  /** Absent when the tokens are not shown. */
  t: string | undefined;
  queued: EnqueueResult;
  childDepth: (id: string) => number;
}>): LocalizedText => {
  const added: LocalizedText = Arr.isEmpty(queued.added)
    ? ({ en: '', ja: '' } as const)
    : ({
        en: ` ${list(queued.added, 'en')} ${byCount(queued.added, 'goes', 'go')} into the bucket of depth ${depthsOf(queued.added, childDepth)}.`,
        ja: `${list(queued.added, 'ja')} を深さ ${depthsOf(queued.added, childDepth)} のバケットに入れます。`,
      } as const);

  const already: LocalizedText = Arr.isEmpty(queued.already)
    ? ({ en: '', ja: '' } as const)
    : ({
        en: ` ${list(queued.already, 'en')} ${byCount(queued.already, 'is', 'are')} already waiting in the queue${t === undefined ? '' : ` ${t}`} (the bucket of depth ${depthsOf(queued.already, childDepth)}), so ${byCount(queued.already, 'it is', 'they are')} not added twice.`,
        ja: `${list(queued.already, 'ja')} はすでにキュー${t === undefined ? '' : ` ${t}`}（深さ ${depthsOf(queued.already, childDepth)} のバケット）に並んでいるので、二度は入れません。`,
      } as const);

  const none: LocalizedText =
    Arr.isEmpty(queued.added) && Arr.isEmpty(queued.already)
      ? ({
          en: ` ${node} has no children.`,
          ja: `${node} に子はありません。`,
        } as const)
      : ({ en: '', ja: '' } as const);

  return {
    en: `${node} computes ${formula} and calls setNext(${args}).${added.en}${already.en}${none.en}`,
    ja: `${node} は ${formula} を計算し、setNext(${args}) を呼びます。${added.ja}${already.ja}${none.ja}`,
  };
};

const depthsOf = (
  ids: readonly string[],
  childDepth: (id: string) => number,
): string =>
  Array.from(new Set(ids.map(childDepth)), (d) => d.toString()).join(', ');

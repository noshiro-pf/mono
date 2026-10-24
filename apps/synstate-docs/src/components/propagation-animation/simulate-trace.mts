import { Arr } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import type { LocalizedText } from './scenario.mjs';
import {
  undefinedText,
  type CodeLine,
  type Local,
  type NodeRow,
  type QueueState,
  type TraceNode,
  type TraceStep,
} from './trace-step.mjs';

export type TraceScenarioName = 'filterDiamond' | 'nestedWrite';

/** The graph of a scenario, for the drawing. */
export const traceNodesOf = (name: TraceScenarioName): readonly TraceNode[] =>
  traceScenarios[name].nodes;

/**
 * Runs a scenario's writes through a model of synstate's propagation
 * (`propagation-state.mts`, `setNext`, and the `tryUpdate` of `map`, `filter`
 * and `combine`), recording every field it reads or writes. Returns the steps
 * of each write, each list starting from the state the write starts in.
 */
export const traceUpdates = (
  name: TraceScenarioName,
): readonly (readonly TraceStep[])[] => {
  const scenario = traceScenarios[name];

  const mut_nodes = new Map<string, SimNode>(
    scenario.nodes.map((n) => [
      n.id,
      {
        def: n,
        children: scenario.nodes
          .filter((c) => c.parents.includes(n.id))
          .map((c) => c.id),
        snapshot: n.initialValue,
        updateToken: 't0',
        queuedFor: undefined,
        nextInQueue: undefined,
      },
    ]),
  );

  const mut_module: MutableModule = {
    propagationDepth: 0,
    outermostToken: undefined,
    level: 0,
    heads: [],
    tails: [],
  };

  const mut_run: MutableRun = {
    tokenCount: 0,
    freshTokens: [],
    queues: [],
    stack: [],
    emitCount: new Map(),
    skipped: new Set(),
    steps: [],
  };

  const nodeOf = (id: string): SimNode => {
    const n = mut_nodes.get(id);

    if (n === undefined) {
      throw new Error(`unknown node ${id}`);
    }

    return n;
  };

  const record = (
    step: Readonly<{
      code: readonly CodeLineId[];
      locals?: readonly Local[];
      activeNode?: string;
      caption: LocalizedText;
    }>,
  ): void => {
    mut_run.steps.push({
      freshTokens: Array.from(mut_run.freshTokens),
      module: {
        propagationDepth: mut_module.propagationDepth,
        outermostToken: mut_module.outermostToken ?? undefinedText,
        level: mut_module.level,
        heads: mut_module.heads.map((h) => h ?? undefinedText),
        tails: mut_module.tails.map((t) => t ?? undefinedText),
      },
      queues: mut_run.queues.map(showQueue),
      locals: step.locals ?? [],
      nodes: scenario.nodes.map((d): NodeRow => {
        const n = nodeOf(d.id);

        return {
          id: d.id,
          depth: d.depth,
          snapshot: show(n.snapshot),
          updateToken: n.updateToken,
          queuedFor: n.queuedFor ?? undefinedText,
          nextInQueue: n.nextInQueue ?? undefinedText,
          emitted: mut_run.emitCount.has(d.id),
          skipped: mut_run.skipped.has(d.id),
        };
      }),
      stack: Array.from(mut_run.stack),
      code: step.code,
      activeNode: step.activeNode,
      caption: step.caption,
    });
  };

  /** The queue of the innermost update open now. */
  const queueOf = (): MutableQueue => {
    const queue = mut_run.queues.at(-1);

    if (queue === undefined) {
      throw new Error('no update is open');
    }

    return queue;
  };

  /** `UpdateQueue.enqueueChildren`, one child at a time. */
  const enqueueChildren = (parent: string): void => {
    const mut_q = queueOf();

    const { children } = nodeOf(parent);

    if (Arr.isEmpty(children)) {
      return;
    }

    mut_run.stack.push(
      `${mut_q.token}.enqueueChildren({${children.join(', ')}})`,
    );

    for (const id of children) {
      const mut_child = nodeOf(id);

      if (mut_child.queuedFor === mut_q.token) {
        record({
          code: ['sn3', 'ec1', 'ec2'],
          locals: [{ name: 'child', value: id }],
          activeNode: parent,
          caption: {
            en: `child = ${id}. ${id}.queuedFor is already ${mut_q.token}: ${id} waits in this update's list, put there by another parent. continue — a node is queued once per update.`,
            ja: `child = ${id}。${id}.queuedFor はすでに ${mut_q.token} です。${id} は別の親によってこの更新のリストに入っているので、continue します。1 回の更新でノードがキューに入るのは 1 回だけです。`,
          },
        });

        continue;
      }

      if (mut_q.spilled?.has(id) === true) {
        record({
          code: ['sn3', 'ec1', 'ec2'],
          locals: [{ name: 'child', value: id }],
          activeNode: parent,
          caption: {
            en: `child = ${id}. spilled already has ${id}: continue — a node is queued once per update.`,
            ja: `child = ${id}。spilled にすでに ${id} があるので continue します。1 回の更新でノードがキューに入るのは 1 回だけです。`,
          },
        });

        continue;
      }

      const index = mut_child.def.depth - mut_q.base;

      const grows = index >= mut_q.size;

      const sizeBefore = mut_q.size;

      if (grows) {
        mut_q.size = index + 1;
      }

      const i = index.toString();

      const indexText =
        `index = ${id}.depth − base = ${mut_child.def.depth.toString()} − ${mut_q.base.toString()} = ${i}` as const;

      const sizeText: LocalizedText = grows
        ? ({
            en: `index ≥ size (${sizeBefore.toString()}), so size = ${mut_q.size.toString()}.`,
            ja: `index ≥ size（${sizeBefore.toString()}）なので size = ${mut_q.size.toString()} にします。`,
          } as const)
        : ({
            en: `index < size (${mut_q.size.toString()}), so size stays.`,
            ja: `index < size（${mut_q.size.toString()}）なので size は変わりません。`,
          } as const);

      const heldElsewhere = mut_child.queuedFor;

      record({
        code: ['sn3', 'ec1', 'ec2', 'ec3', 'ec4'],
        locals: [
          { name: 'child', value: id },
          { name: 'index', value: i },
        ],
        activeNode: parent,
        caption:
          heldElsewhere === undefined
            ? {
                en: `child = ${id}. ${id}.queuedFor is undefined and spilled does not have it, so this update has not queued ${id} yet. ${indexText}. ${sizeText.en}`,
                ja: `child = ${id}。${id}.queuedFor は undefined で spilled にもないので、この更新はまだ ${id} をキューに入れていません。${indexText}。${sizeText.ja}`,
              }
            : {
                en: `child = ${id}. ${id}.queuedFor is ${heldElsewhere}, not ${mut_q.token}, and spilled does not have it, so this update has not queued ${id} yet. ${indexText}. ${sizeText.en}`,
                ja: `child = ${id}。${id}.queuedFor は ${heldElsewhere} で ${mut_q.token} ではなく、spilled にもないので、この更新はまだ ${id} をキューに入れていません。${indexText}。${sizeText.ja}`,
              },
      });

      if (heldElsewhere !== undefined || !mut_q.ownsLists) {
        const mut_spilled = mut_q.spilled ?? new Set<string>();

        mut_spilled.add(id);

        mut_q.spilled = mut_spilled;

        const mut_spill = mut_q.spill ?? [];

        while (mut_spill.length <= index) {
          mut_spill.push(undefined);
        }

        mut_spill[index] = Arr.toPushed(mut_spill[index] ?? [], id);

        mut_q.spill = mut_spill;

        const reasons: LocalizedText =
          heldElsewhere === undefined
            ? ({
                en: 'ownsLists is false: the lists belong to the update this one is nested in',
                ja: 'ownsLists が false です。リストはこの更新を内側に持つ外側の更新のものです',
              } as const)
            : mut_q.ownsLists
              ? ({
                  en: `${id}.queuedFor is ${heldElsewhere}: ${id} waits in that update's list, and its one nextInQueue is taken`,
                  ja: `${id}.queuedFor が ${heldElsewhere} です。${id} はその更新のリストで待っていて、1 本しかない nextInQueue は使用中です`,
                } as const)
              : ({
                  en: `${id}.queuedFor is ${heldElsewhere}, so ${id} waits in that update's list, and in any case ownsLists is false`,
                  ja: `${id}.queuedFor が ${heldElsewhere} で ${id} はその更新のリストで待っていますし、そもそも ownsLists が false です`,
                } as const);

        record({
          code: ['ec5', 'sp1'],
          locals: [
            { name: 'child', value: id },
            { name: 'index', value: i },
          ],
          activeNode: parent,
          caption: {
            en: `${reasons.en}. So ${id} is spilled: spilled = ${showSet(mut_spilled)}, and spill[${i}] gets ${id}. Neither ${id}.queuedFor nor ${id}.nextInQueue nor heads and tails is touched.`,
            ja: `${reasons.ja}。そこで ${id} を spill に入れます。spilled = ${showSet(mut_spilled)} とし、spill[${i}] に ${id} を加えます。${id}.queuedFor・${id}.nextInQueue・heads・tails には触れません。`,
          },
        });

        continue;
      }

      mut_child.queuedFor = mut_q.token;

      const tail = mut_module.tails[index];

      while (mut_module.heads.length <= index) {
        mut_module.heads.push(undefined);

        mut_module.tails.push(undefined);
      }

      if (tail === undefined) {
        mut_module.heads[index] = id;
      } else {
        const mut_tail = nodeOf(tail);

        mut_tail.nextInQueue = id;
      }

      mut_module.tails[index] = id;

      record({
        code: ['ec5', 'ec6', tail === undefined ? 'ec7' : 'ec8', 'ec9'],
        locals: [
          { name: 'child', value: id },
          { name: 'index', value: i },
        ],
        activeNode: parent,
        caption:
          tail === undefined
            ? {
                en: `${id} is not in another update's list and ownsLists is true, so it goes in the lists: ${id}.queuedFor = ${mut_q.token}. tails[${i}] is undefined — the list is empty — so heads[${i}] = ${id}, and tails[${i}] = ${id}.`,
                ja: `${id} は他の更新のリストになく、ownsLists は true なので、リストに入れます。${id}.queuedFor = ${mut_q.token}。tails[${i}] は undefined（リストが空）なので heads[${i}] = ${id}、tails[${i}] = ${id} とします。`,
              }
            : {
                en: `${id} goes in the lists: ${id}.queuedFor = ${mut_q.token}. tails[${i}] is ${tail}, so ${tail}.nextInQueue = ${id} links ${id} after it, and tails[${i}] = ${id}. No array grows: the link is a field of ${tail}.`,
                ja: `${id} をリストに入れます。${id}.queuedFor = ${mut_q.token}。tails[${i}] は ${tail} なので、${tail}.nextInQueue = ${id} で ${tail} の後ろにつなぎ、tails[${i}] = ${id} とします。配列は伸びず、つなぎ目は ${tail} 自身のフィールドです。`,
              },
      });
    }

    mut_run.stack.pop();
  };

  /**
   * `setNext`: stores the value and the token, queues the children, and
   * calls the subscriber.
   */
  const setNext = (
    id: string,
    value: Value,
    code: readonly CodeLineId[],
    why: LocalizedText,
  ): void => {
    const mut_n = nodeOf(id);

    const token = queueOf().token;

    mut_n.updateToken = token;

    mut_n.snapshot = value;

    mut_run.emitCount.set(id, (mut_run.emitCount.get(id) ?? 0) + 1);

    mut_run.stack.push(`${id}.setNext(${show(value)}, ${token})`);

    const { children } = mut_n;

    const { subscriber } = mut_n.def;

    const notify: LocalizedText =
      subscriber === undefined
        ? ({
            en: 'before notifying subscribers (there are none here)',
            ja: 'そのあと subscriber に通知します（ここでは subscriber はいません）',
          } as const)
        : ({
            en: `before calling ${id}'s subscriber`,
            ja: `そのあと ${id} の subscriber を呼びます`,
          } as const);

    record({
      code: [...code, 'sn1', 'sn2'],
      activeNode: id,
      caption: {
        en: `${why.en === '' ? '' : `${why.en} `}setNext stamps ${id}.updateToken = ${token} and stores ${id}.snapshot = ${show(value)}. ${Arr.isEmpty(children) ? `${id} has no children to queue; next comes its subscriber${subscriber === undefined ? ', and it has none' : ''}.` : `Then it queues its children ${children.join(' and ')} in ${token}, ${notify.en}.`}`,
        ja: `${why.ja}setNext は ${id}.updateToken = ${token} と印を付け、${id}.snapshot = ${show(value)} を書き込みます。${Arr.isEmpty(children) ? `${id} には子がないので、次は subscriber です${subscriber === undefined ? '（subscriber もいません）' : ''}。` : `続いて子 ${children.join('、')} を ${token} に入れ、${notify.ja}。`}`,
      },
    });

    enqueueChildren(id);

    if (subscriber !== undefined) {
      callSubscriber(id, subscriber, value);
    }

    mut_run.stack.pop();
  };

  const callSubscriber = (
    id: string,
    subscriber: Subscriber,
    value: Value,
  ): void => {
    if (subscriber.kind === 'log') {
      record({
        code: ['sn4'],
        activeNode: id,
        caption: {
          en: `${id}'s subscriber receives ${show(value)}${(mut_run.emitCount.get(id) ?? 0) > 1 ? ` — the same value again, its ${ordinal(mut_run.emitCount.get(id) ?? 0)} call in this setA` : ''}.`,
          ja: `${id} の subscriber が ${show(value)} を受け取ります${(mut_run.emitCount.get(id) ?? 0) > 1 ? `。同じ値で、この setA の中で ${(mut_run.emitCount.get(id) ?? 0).toString()} 回目の呼び出しです` : ''}。`,
        },
      });

      return;
    }

    const v = numberOf(value);

    const call = `${subscriber.setter}(${v.toString()})` as const;

    mut_run.stack.push(`subscriber(${v.toString()})`);

    record({
      code: ['sn4'],
      activeNode: id,
      caption: {
        en: `${id}'s subscriber runs with ${v.toString()}, which is > 0, so it calls ${call}: a write to the root ${subscriber.root} while ${queueOf().token} is still draining. Everything ${call} does happens here, inside ${id}.setNext, before ${queueOf().token} visits another node.`,
        ja: `${id} の subscriber が ${v.toString()} で呼ばれます。0 より大きいので ${call} を呼びます。${queueOf().token} がまだ drain している間の、ルート ${subscriber.root} への書き込みです。${call} の処理はすべてここ、${id}.setNext の中で行われ、そのあいだ ${queueOf().token} は次のノードに進みません。`,
      },
    });

    const outer = queueOf();

    update(subscriber.root, v, call);

    record({
      code: ['sn4'],
      activeNode: id,
      caption: {
        en: `${call} has returned to ${id}'s subscriber, and ${outer.token} carries on where it was. Its lists were never touched: ${listsText(mut_module.heads)}, and the nodes in them still have queuedFor = ${outer.token}.`,
        ja: `${call} が ${id} の subscriber に戻り、${outer.token} は中断したところから続けます。${outer.token} のリストには一度も触れていません。${listsText(mut_module.heads)} のままで、そこにあるノードの queuedFor も ${outer.token} のままです。`,
      },
    });

    mut_run.stack.pop();
  };

  /** The `tryUpdate` of each operator. */
  const tryUpdate = (id: string, call: CodeLineId): void => {
    const n = nodeOf(id);

    const token = queueOf().token;

    mut_run.stack.push(`${id}.tryUpdate(${token})`);

    const parents = n.def.parents.map(nodeOf);

    const [first] = parents;

    const operator = n.def.operator;

    if (operator.kind === 'combine') {
      const emitted = parents.filter((p) => p.updateToken === token);

      const tokens = parents
        .map((p) => `${p.def.id}.updateToken = ${p.updateToken}`)
        .join(', ');

      if (Arr.isEmpty(emitted)) {
        skip(id, [call, 'cb1'], {
          en: `${tokens}: no parent emitted in ${token}, so ${id} returns without setNext.`,
          ja: `${tokens}：${token} で発行した親がないので、${id} は setNext せずに戻ります。`,
        });
      } else {
        const value = parents.map((p) => numberOf(p.snapshot));

        setNext(id, value, [call, 'cb1', 'cb2'], {
          en: `${tokens}: ${emitted.map((p) => p.def.id).join(' and ')} emitted in ${token}, so ${id} combines the latest value of every parent, emitted in ${token} or not: [${value.join(', ')}].`,
          ja: `${tokens}：${emitted.map((p) => p.def.id).join('、')} が ${token} で発行しているので、${id} は（${token} で発行したかどうかにかかわらず）すべての親の最新値を組み合わせます：[${value.join(', ')}]。`,
        });
      }
    } else if (first !== undefined && operator.kind !== 'root') {
      const p = first.def.id;

      const parentEmitted = first.updateToken === token;

      if (!parentEmitted) {
        skip(id, [call, operator.kind === 'filter' ? 'fl1' : 'mp1'], {
          en: `${p}.updateToken is ${first.updateToken}, not ${token}: ${p} did not emit in this update, so ${id} returns without setNext.`,
          ja: `${p}.updateToken は ${first.updateToken} で ${token} ではありません。${p} はこの更新で発行していないので、${id} は setNext せずに戻ります。`,
        });
      } else if (operator.kind === 'filter') {
        const v = numberOf(first.snapshot);

        if (v % 2 === 0) {
          setNext(id, v, [call, 'fl1', 'fl2'], {
            en: `${p}.updateToken is ${token}, so ${p} emitted in this update. isEven(${v.toString()}) is true, so ${id} passes ${v.toString()} on.`,
            ja: `${p}.updateToken は ${token} なので、${p} はこの更新で発行しています。isEven(${v.toString()}) は true なので、${id} は ${v.toString()} をそのまま通します。`,
          });
        } else {
          skip(id, [call, 'fl1', 'fl2'], {
            en: `${p}.updateToken is ${token}, so ${p} emitted in this update. But isEven(${v.toString()}) is false, so ${id} does not call setNext: its updateToken stays ${n.updateToken} and its snapshot ${show(n.snapshot)}, and none of its children (${n.children.join(', ')}) is queued.`,
            ja: `${p}.updateToken は ${token} なので、${p} はこの更新で発行しています。しかし isEven(${v.toString()}) は false なので、${id} は setNext を呼びません。updateToken は ${n.updateToken}、snapshot は ${show(n.snapshot)} のままで、子（${n.children.join('、')}）はどれもキューに入りません。`,
          });
        }
      } else {
        const v = first.snapshot;

        const result = operator.apply(v);

        setNext(id, result, [call, 'mp1', 'mp2'], {
          en: `${p}.updateToken is ${token}, so ${p} emitted in this update: ${id} maps its value, ${operator.formula(v)} = ${result.toString()}.`,
          ja: `${p}.updateToken は ${token} なので、${p} はこの更新で発行しています。${id} はその値を変換します：${operator.formula(v)} = ${result.toString()}。`,
        });
      }
    }

    mut_run.stack.pop();
  };

  const skip = (
    id: string,
    code: readonly CodeLineId[],
    caption: LocalizedText,
  ): void => {
    mut_run.skipped.add(id);

    record({ code, activeNode: id, caption });
  };

  /** `UpdateQueue.drain`, with the end of each list told in the next step. */
  const drain = (): void => {
    const mut_q = queueOf();

    const token = mut_q.token;

    mut_run.stack.push(`drainUpdate(${token})`);

    let mut_endOfBucket: LocalizedText = { en: '', ja: '' };

    // `size` grows while the lists are walked, which a `range` built at the
    // start would miss.
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_index = 0; mut_index < mut_q.size; mut_index += 1) {
      const i = mut_index.toString();

      const depth = (mut_q.base + mut_index).toString();

      const loopHead = (
        mut_index === 0 ? (['su4'] as const) : (['dr8', 'dr9'] as const)
      ) satisfies readonly CodeLineId[];

      const bucket: LocalizedText = {
        en: `${mut_endOfBucket.en}index = ${i} < size (${mut_q.size.toString()}): the bucket of depth base + index = ${depth}.`,
        ja: `${mut_endOfBucket.ja}index = ${i} < size（${mut_q.size.toString()}）：深さ base + index = ${depth} のバケットです。`,
      } as const;

      let mut_previous: string | undefined = undefined;

      if (mut_q.ownsLists) {
        const head = mut_module.heads[mut_index];

        mut_module.heads[mut_index] = undefined;

        mut_module.tails[mut_index] = undefined;

        record({
          code: [...loopHead, 'dr1', 'dr1a', 'dr2', 'dr3'],
          locals: [
            { name: 'index', value: i },
            { name: 'curr', value: head ?? undefinedText },
          ],
          activeNode: head,
          caption: {
            en: `${bucket.en} curr = heads[${i}] = ${head ?? 'undefined'}, and heads[${i}] and tails[${i}] are cleared: from here on the list is held only by curr and the nodes' nextInQueue.`,
            ja: `${bucket.ja}curr = heads[${i}] = ${head ?? 'undefined'} とし、heads[${i}] と tails[${i}] を空にします。ここからリストをたどれるのは curr と各ノードの nextInQueue だけです。`,
          },
        });

        let mut_curr = head;

        while (mut_curr !== undefined) {
          const mut_node = nodeOf(mut_curr);

          const next = mut_node.nextInQueue;

          mut_node.nextInQueue = undefined;

          mut_node.queuedFor = undefined;

          const curr = mut_curr;

          record({
            code: [
              ...(mut_previous === undefined ? [] : (['dr8'] as const)),
              'dr4',
              'dr5',
              'dr6',
            ],
            locals: [
              { name: 'index', value: i },
              { name: 'curr', value: curr },
              { name: 'next', value: next ?? undefinedText },
            ],
            activeNode: curr,
            caption: {
              en: `${mut_previous === undefined ? '' : `curr = next = ${curr}. `}next = ${curr}.nextInQueue = ${next ?? 'undefined'}. Then ${curr}.nextInQueue and ${curr}.queuedFor are cleared: ${curr} is free to be queued again, which none of its parents will do in this update, as they are all shallower and done.`,
              ja: `${mut_previous === undefined ? '' : `curr = next = ${curr}。`}next = ${curr}.nextInQueue = ${next ?? 'undefined'}。続いて ${curr}.nextInQueue と ${curr}.queuedFor を空にします。${curr} はもう一度キューに入れる状態になりますが、親はすべて浅く処理済みなので、この更新で入れ直されることはありません。`,
            },
          });

          tryUpdate(curr, 'dr7');

          mut_previous = curr;

          mut_curr = next;
        }
      } else {
        record({
          code: [...loopHead, 'dr1', 'dr1a'],
          locals: [{ name: 'index', value: i }],
          caption: {
            en: `${bucket.en} ownsLists is false, so this update has no list to walk: heads and tails belong to the outer update.`,
            ja: `${bucket.ja}ownsLists が false なので、この更新にはたどるリストがありません。heads と tails は外側の更新のものです。`,
          },
        });
      }

      const listEnd: LocalizedText =
        mut_previous === undefined
          ? ({ en: '', ja: '' } as const)
          : ({
              en: 'curr = next = undefined, so the list ends; ',
              ja: 'curr = next = undefined でリストが終わります。',
            } as const);

      const spilled = mut_q.spill?.[mut_index] ?? [];

      for (const id of spilled) {
        record({
          code: ['dr9'],
          locals: [
            { name: 'index', value: i },
            { name: 'node', value: id },
          ],
          activeNode: id,
          caption: {
            en: `${listEnd.en}spill[${i}] holds ${id}: node = ${id}. A spilled node is visited right after the list of its depth, so the visits stay in order of depth.`,
            ja: `${listEnd.ja}spill[${i}] には ${id} があります。node = ${id} とします。spill に入れたノードは同じ深さのリストの直後に訪れるので、訪問は深さの順のままです。`,
          },
        });

        tryUpdate(id, 'dr9');
      }

      mut_endOfBucket = Arr.isNonEmpty(spilled)
        ? { en: '', ja: '' }
        : mut_q.spill === undefined
          ? {
              en: `${listEnd.en}spill is undefined, so nothing was spilled at this depth. `,
              ja: `${listEnd.ja}spill は undefined なので、この深さで退避したノードはありません。`,
            }
          : {
              en: `${listEnd.en}spill[${i}] is empty. `,
              ja: `${listEnd.ja}spill[${i}] は空です。`,
            };
    }

    const size = mut_q.size;

    mut_q.size = 0;

    record({
      code: ['dr8', 'dr9', 'dr1', 'dr10'],
      locals: [{ name: 'index', value: size.toString() }],
      caption: {
        en: `${mut_endOfBucket.en}index = ${size.toString()} is not < size (${size.toString()}): every bucket has been visited. size = 0${mut_q.ownsLists ? ', since every list is empty again' : ''}.`,
        ja: `${mut_endOfBucket.ja}index = ${size.toString()} は size（${size.toString()}）未満ではないので、すべてのバケットを訪れました。${mut_q.ownsLists ? 'リストはすべて空に戻ったので ' : ''}size = 0 にします。`,
      },
    });

    mut_run.stack.pop();
  };

  /** `startUpdate` of a root, called as `call`: `setA(1)`. */
  const update = (rootId: string, input: number, call: string): void => {
    const nested = mut_module.level > 0;

    if (!nested) {
      mut_run.freshTokens = [];

      mut_run.emitCount.clear();

      mut_run.skipped.clear();
    }

    mut_run.tokenCount += 1;

    const token = `t${mut_run.tokenCount.toString()}` as const;

    mut_run.freshTokens.push(token);

    const root = nodeOf(rootId);

    const depth = root.def.depth;

    const outer = mut_run.queues.at(-1);

    mut_run.stack.push(call, `${rootId}.startUpdate(${input.toString()})`);

    mut_module.level += 1;

    const ownsLists = mut_module.level === 1;

    mut_run.queues.push({
      token,
      base: depth + 1,
      ownsLists,
      size: 0,
      spill: undefined,
      spilled: undefined,
    });

    mut_run.stack.push(`openUpdate(${depth.toString()})`);

    record({
      code: ['su1', 'ou1', 'ou2'],
      locals: [{ name: 'depth', value: depth.toString() }],
      activeNode: rootId,
      caption:
        outer === undefined
          ? {
              en: `${call} calls ${rootId}.next(${input.toString()}), which starts an update. openUpdate raises level to 1 and creates the UpdateQueue ${token}: base = ${rootId}.depth + 1 = ${(depth + 1).toString()}, so bucket 0 holds depth ${(depth + 1).toString()}; ownsLists = (level === 1) = true, so this update may use heads, tails and the nodes' own fields. ${token} is the update's token and its queue at once.`,
              ja: `${call} は ${rootId}.next(${input.toString()}) を呼び、更新が始まります。openUpdate は level を 1 に上げ、UpdateQueue ${token} を作ります。base = ${rootId}.depth + 1 = ${(depth + 1).toString()} なのでバケット 0 は深さ ${(depth + 1).toString()} です。ownsLists = (level === 1) = true なので、この更新は heads・tails とノード自身のフィールドを使えます。${token} はこの更新のトークンであり、同時にキューでもあります。`,
            }
          : {
              en: `${call} calls ${rootId}.next(${input.toString()}). propagation.depth > 0, so ${rootId} warns once that it was written to during an update, and then starts one anyway: openUpdate raises level to ${mut_module.level.toString()} and creates ${token}, with base = ${(depth + 1).toString()} and ownsLists = (level === 1) = false. ${outer.token} is still open and owns heads, tails and every queuedFor and nextInQueue, so ${token} may not touch them.`,
              ja: `${call} は ${rootId}.next(${input.toString()}) を呼びます。propagation.depth > 0 なので、${rootId} は更新中に書き込まれたことを一度だけ警告し、そのうえで更新を始めます。openUpdate は level を ${mut_module.level.toString()} に上げて ${token} を作ります。base = ${(depth + 1).toString()}、ownsLists = (level === 1) = false です。${outer.token} がまだ開いていて、heads・tails とすべての queuedFor・nextInQueue を使っているので、${token} はそれらに触れられません。`,
            },
    });

    mut_run.stack.pop();

    const outermost = mut_module.propagationDepth === 0;

    if (outermost) {
      mut_module.outermostToken = token;
    }

    mut_module.propagationDepth += 1;

    mut_run.stack.push(`beginPropagation(${token})`);

    record({
      code: ['su2', 'bp1', 'bp2'],
      activeNode: rootId,
      caption: outermost
        ? {
            en: `beginPropagation: no update was propagating (depth 0), so outermostToken = ${token}; depth = 1. While depth > 0, a write to a root counts as a write during propagation and warns once.`,
            ja: `beginPropagation：伝播中の更新はなかった（depth 0）ので outermostToken = ${token}、depth = 1 にします。depth > 0 の間にルートへ書き込むと、伝播中の書き込みとして一度だけ警告が出ます。`,
          }
        : {
            en: `beginPropagation: depth is ${(mut_module.propagationDepth - 1).toString()}, not 0, so outermostToken stays ${mut_module.outermostToken ?? 'undefined'}; depth = ${mut_module.propagationDepth.toString()}.`,
            ja: `beginPropagation：depth は ${(mut_module.propagationDepth - 1).toString()} で 0 ではないので、outermostToken は ${mut_module.outermostToken ?? 'undefined'} のままです。depth = ${mut_module.propagationDepth.toString()} にします。`,
          },
    });

    mut_run.stack.pop();

    setNext(rootId, input, ['su3'], { en: '', ja: '' });

    drain();

    mut_run.stack.push(`closeUpdate(${token})`);

    mut_module.level -= 1;

    record({
      code: ['su5', 'cu1', 'cl1', 'cu2'],
      caption: ownsLists
        ? {
            en: 'closeUpdate: drain left every list empty and size 0, so close has nothing to unlink (it would, had a tryUpdate thrown). level = 0.',
            ja: 'closeUpdate：drain がリストをすべて空にして size を 0 にしたので、close が外すものはありません（tryUpdate が例外を投げた場合に働きます）。level = 0 にします。',
          }
        : {
            en: `closeUpdate: ownsLists is false, so close returns at once — this update linked nothing. level = ${mut_module.level.toString()}. Its spill and spilled are not cleared: nothing reads them once ${token} is closed.`,
            ja: `closeUpdate：ownsLists が false なので、close はすぐに戻ります。この更新は何もつないでいません。level = ${mut_module.level.toString()} にします。spill と spilled は片付けませんが、${token} が閉じたあとは誰も読みません。`,
          },
    });

    mut_run.stack.pop();

    mut_module.propagationDepth -= 1;

    if (outermost) {
      mut_module.outermostToken = undefined;
    }

    mut_run.stack.push('endPropagation()');

    record({
      code: ['su6', 'ep1', 'ep2'],
      caption: outermost
        ? {
            en: 'endPropagation: depth = 0, so outermostToken = undefined, and the work deferred with runAfterPropagation runs (none here).',
            ja: 'endPropagation：depth = 0 になったので outermostToken = undefined にし、runAfterPropagation で後回しにした処理を実行します（ここではありません）。',
          }
        : {
            en: `endPropagation: depth = ${mut_module.propagationDepth.toString()}, not 0, so outermostToken stays ${mut_module.outermostToken ?? 'undefined'}, and deferred work waits for the outer update to end.`,
            ja: `endPropagation：depth = ${mut_module.propagationDepth.toString()} で 0 ではないので、outermostToken は ${mut_module.outermostToken ?? 'undefined'} のままで、後回しにした処理は外側の更新が終わるまで待ちます。`,
          },
    });

    mut_run.stack.pop();

    mut_run.stack.pop();

    mut_run.stack.pop();

    mut_run.queues.pop();

    if (nested) {
      return;
    }

    const emitted = scenario.nodes
      .map((n) => n.id)
      .filter((id) => mut_run.emitCount.has(id));

    const emittedText = emitted
      .map((id) => {
        const count = mut_run.emitCount.get(id) ?? 0;

        return count > 1 ? `${id} (×${count.toString()})` : id;
      })
      .join(', ');

    const skipped = Array.from(mut_run.skipped);

    const unreached = scenario.nodes
      .map((n) => n.id)
      .filter((id) => !mut_run.emitCount.has(id) && !mut_run.skipped.has(id));

    const stamped = mut_run.freshTokens.map((t) => ({
      token: t,
      nodes: scenario.nodes
        .filter((n) => nodeOf(n.id).updateToken === t)
        .map((n) => n.id),
    }));

    record({
      code: [],
      caption: {
        en: `${call} has returned. ${emittedText} emitted; ${Arr.isEmpty(skipped) ? 'no node was visited without emitting' : `${skipped.join(', ')} was visited and did not emit`}${Arr.isNonEmpty(unreached) ? `, and ${unreached.join(', ')} was never reached` : ''}. Every queue field is back where it started; ${stamped.map((s) => `${s.token} lives on only as the updateToken of ${s.nodes.join(', ')}`).join(', and ')}.`,
        ja: `${call} が戻りました。${emittedText.replaceAll(', ', '、')} が発行し、${Arr.isEmpty(skipped) ? '訪れて発行しなかったノードはありません' : `${skipped.join('、')} は訪れたものの発行しませんでした`}${Arr.isNonEmpty(unreached) ? `。${unreached.join('、')} には更新が届いていません` : ''}。キューのフィールドはすべて元に戻り、${stamped.map((s) => `${s.token} は ${s.nodes.join('、')} の updateToken として残るだけです`).join('。')}。`,
      },
    });
  };

  const mut_byWrite: (readonly TraceStep[])[] = [];

  record({ code: [], caption: scenario.intro });

  for (const write of scenario.writes) {
    const before = mut_run.steps.at(-1);

    const start = mut_run.steps.length;

    const call = `${setterOf(write.root)}(${write.value.toString()})` as const;

    update(write.root, write.value, call);

    mut_byWrite.push([
      ...(before === undefined || start === 1
        ? ([] as const)
        : ([
            {
              ...before,
              caption: {
                en: `Where the previous update left things: ${before.nodes.map((n) => `${n.id} holds ${n.snapshot} (${n.updateToken})`).join(', ')}. queuedFor and nextInQueue are undefined everywhere, and heads and tails hold only undefined. Next: ${call}.`,
                ja: `前の更新が終わった状態です：${before.nodes.map((n) => `${n.id} は ${n.snapshot}（${n.updateToken}）`).join('、')}。queuedFor と nextInQueue はすべて undefined で、heads と tails には undefined しかありません。次は ${call} です。`,
              },
            },
          ] as const)),
      ...mut_run.steps.slice(start === 1 ? 0 : start),
    ]);
  }

  return mut_byWrite;
};

/** The source shown beside the trace, one `[id, text]` per line. */
export const traceCode = [
  ['h1', '// ManagerObservableClass: a root, such as A'],
  ['su0', 'startUpdate(nextValue) {'],
  ['su1', '  const token = openUpdate(this.depth);'],
  ['su2', '  beginPropagation(token);'],
  ['su3', '  this.setNext(nextValue, token);'],
  ['su4', '  drainUpdate(token);'],
  ['su5', '  closeUpdate(token);'],
  ['su6', '  endPropagation();'],
  ['su7', '}'],
  ['b1', ''],
  ['h2', '// ObservableBaseClass'],
  ['sn0', 'setNext(nextValue, token) {'],
  ['sn1', '  this.#updateToken = token;'],
  ['sn2', '  this.#snapshot = Optional.some(nextValue);'],
  ['sn3', '  enqueueChildren(this.#children, token);'],
  [
    'sn4',
    '  for (const subscriber of this.#subscribers) subscriber.onNext(nextValue);',
  ],
  ['sn5', '}'],
  ['b2', ''],
  ['h3', '// propagation-state.mts'],
  ['ou0', 'openUpdate(depth) {'],
  ['ou1', '  queueState.level += 1;'],
  ['ou2', '  return new UpdateQueue(depth + 1, queueState.level === 1);'],
  ['ou3', '}'],
  ['bp0', 'beginPropagation(token) {'],
  ['bp1', '  if (propagation.depth === 0) propagation.outermostToken = token;'],
  ['bp2', '  propagation.depth += 1;'],
  ['bp3', '}'],
  ['cu0', 'closeUpdate(token) {'],
  ['cu1', '  token.close();'],
  ['cu2', '  queueState.level -= 1;'],
  ['cu3', '}'],
  ['ep0', 'endPropagation() {'],
  ['ep1', '  propagation.depth -= 1;'],
  [
    'ep2',
    '  if (depth === 0) { outermostToken = undefined; /* run deferred */ }',
  ],
  ['ep3', '}'],
  ['b3', ''],
  ['h4', '// class UpdateQueue: #base, #ownsLists, #size, #spill, #spilled'],
  ['ec0', 'enqueueChildren(children) {'],
  ['ec1', '  for (const child of children) {'],
  [
    'ec2',
    '    if (child.queuedFor === this || this.#spilled?.has(child)) continue;',
  ],
  ['ec3', '    const index = child.depth - this.#base;'],
  ['ec4', '    if (index >= this.#size) this.#size = index + 1;'],
  [
    'ec5',
    '    if (child.queuedFor !== undefined || !this.#ownsLists) { this.#spill(child, index); continue; }',
  ],
  ['ec6', '    child.queuedFor = this;'],
  ['ec7', '    if (tails[index] === undefined) heads[index] = child;'],
  ['ec8', '    else tails[index].nextInQueue = child;'],
  ['ec9', '    tails[index] = child;'],
  ['ec10', '  }'],
  ['ec11', '}'],
  ['sp0', '#spill(child, index) {'],
  [
    'sp1',
    '  (this.#spilled ??= new Set()).add(child); ((this.#spill ??= [])[index] ??= []).push(child);',
  ],
  ['sp2', '}'],
  ['dr0', 'drain() {'],
  ['dr1', '  for (let index = 0; index < this.#size; index += 1) {'],
  ['dr1a', '    if (this.#ownsLists) {'],
  ['dr2', '      let curr = heads[index];'],
  ['dr3', '      heads[index] = undefined; tails[index] = undefined;'],
  ['dr4', '      while (curr !== undefined) {'],
  ['dr5', '        const next = curr.nextInQueue;'],
  ['dr6', '        curr.nextInQueue = undefined; curr.queuedFor = undefined;'],
  ['dr7', '        curr.tryUpdate(this);'],
  ['dr8', '        curr = next;'],
  ['dr8b', '      }'],
  ['dr8c', '    }'],
  [
    'dr9',
    '    for (const node of this.#spill?.[index] ?? []) node.tryUpdate(this);',
  ],
  ['dr9b', '  }'],
  ['dr10', '  this.#size = 0;'],
  ['dr11', '}'],
  ['cl0', 'close() {'],
  [
    'cl1',
    '  if (!this.#ownsLists) return; /* else unlink what a throw left */',
  ],
  ['cl2', '}'],
  ['b4', ''],
  ['h5', '// tryUpdate(token) of map, filter and combine'],
  ['mp1', 'map:     if (parent.updateToken !== token) return;'],
  ['mp2', '         this.setNext(mapFn(parent.value), token);'],
  ['fl1', 'filter:  if (parent.updateToken !== token) return;'],
  [
    'fl2',
    '         if (predicate(parent.value)) this.setNext(parent.value, token);',
  ],
  [
    'cb1',
    'combine: if (parents.every((parent) => parent.updateToken !== token)) return;',
  ],
  [
    'cb2',
    '         this.setNext(parents.map((parent) => parent.value), token);',
  ],
] as const satisfies readonly CodeLine[];

type CodeLineId = (typeof traceCode)[number][0];

type Value = number | readonly number[];

type Operator = Readonly<
  | { kind: 'root' }
  | { kind: 'filter' }
  | { kind: 'combine' }
  | {
      kind: 'map';
      apply: (value: Value) => number;
      /** The computation, as `1 * 10`. */
      formula: (value: Value) => string;
    }
>;

/** What a node's one subscriber does with each value. */
type Subscriber = Readonly<
  { kind: 'log' } | { kind: 'writeRoot'; root: string; setter: string }
>;

type ModelNode = TraceNode &
  Readonly<{
    operator: Operator;
    initialValue: Value;
    subscriber?: Subscriber;
  }>;

type Scenario = Readonly<{
  /** In creation order, which is the order a parent's children are queued in. */
  nodes: readonly ModelNode[];
  /** The writes to roots, one traced update each. */
  writes: readonly Readonly<{ root: string; value: number }>[];
  /** The caption of the state before the first write. */
  intro: LocalizedText;
}>;

const times =
  (factor: number) =>
  (value: Value): number =>
    numberOf(value) * factor;

const timesFormula =
  (factor: number) =>
  (value: Value): string =>
    `${numberOf(value).toString()} * ${factor.toString()}` as const;

const traceScenarios: ReadonlyRecord<TraceScenarioName, Scenario> = {
  /**
   * The filter diamond of "How SynState Solved the Glitch", with `combine`
   * and the `map` after it as the two nodes they are.
   */
  filterDiamond: {
    nodes: [
      {
        id: 'A',
        depth: 0,
        parents: [],
        op: 'createState(0)',
        x: 330,
        operator: { kind: 'root' },
        initialValue: 0,
      },
      {
        id: 'B',
        depth: 1,
        parents: ['A'],
        op: 'map(n => n * 10)',
        x: 180,
        operator: { kind: 'map', apply: times(10), formula: timesFormula(10) },
        initialValue: 0,
      },
      {
        id: 'D',
        depth: 1,
        parents: ['A'],
        op: 'filter(isEven)',
        x: 480,
        operator: { kind: 'filter' },
        initialValue: 0,
      },
      {
        id: 'BD',
        depth: 2,
        parents: ['B', 'D'],
        op: 'combine([B, D])',
        x: 260,
        operator: { kind: 'combine' },
        initialValue: [0, 0],
      },
      {
        id: 'C',
        depth: 3,
        parents: ['BD'],
        op: 'map(([b, d]) => b + d)',
        x: 260,
        operator: {
          kind: 'map',
          apply: (value) =>
            typeof value === 'number' ? value : Arr.sum(value),
          formula: (value) =>
            typeof value === 'number' ? value.toString() : value.join(' + '),
        },
        initialValue: 0,
      },
      {
        id: 'E',
        depth: 2,
        parents: ['D'],
        op: 'map(n => n * 10)',
        x: 540,
        operator: { kind: 'map', apply: times(10), formula: timesFormula(10) },
        initialValue: 0,
      },
    ],
    writes: [
      { root: 'A', value: 1 },
      { root: 'A', value: 2 },
    ],
    intro: {
      en: 'Every node was created with its initial value and the token t0 (notUpdatedYet), and nothing is queued: queuedFor and nextInQueue are undefined everywhere, and heads and tails are empty.',
      ja: 'どのノードも初期値と、トークン t0（notUpdatedYet）を持って作られ、キューには何もありません。queuedFor と nextInQueue はすべて undefined で、heads と tails は空です。',
    },
  },
  /** A subscriber of `D` writes to the root `R`, which `BDR` also reads. */
  nestedWrite: {
    nodes: [
      {
        id: 'A',
        depth: 0,
        parents: [],
        op: 'createState(0)',
        x: 230,
        operator: { kind: 'root' },
        initialValue: 0,
      },
      {
        id: 'R',
        depth: 0,
        parents: [],
        op: 'createState(0)',
        x: 560,
        operator: { kind: 'root' },
        initialValue: 0,
      },
      {
        id: 'B',
        depth: 1,
        parents: ['A'],
        op: 'map(n => n * 10)',
        x: 130,
        operator: { kind: 'map', apply: times(10), formula: timesFormula(10) },
        initialValue: 0,
      },
      {
        id: 'D',
        depth: 1,
        parents: ['A'],
        op: 'map(n => n * 100)',
        x: 350,
        operator: {
          kind: 'map',
          apply: times(100),
          formula: timesFormula(100),
        },
        initialValue: 0,
        subscriber: { kind: 'writeRoot', root: 'R', setter: 'setR' },
      },
      {
        id: 'BDR',
        depth: 2,
        parents: ['B', 'D', 'R'],
        op: 'combine([B, D, R])',
        x: 330,
        operator: { kind: 'combine' },
        initialValue: [0, 0, 0],
        subscriber: { kind: 'log' },
      },
    ],
    writes: [{ root: 'A', value: 1 }],
    intro: {
      en: "Every node was created with its initial value and the token t0, and nothing is queued. D has a subscriber that calls setR(d) when d > 0, and BDR has one that logs; subscribing ran each once with the current value, so BDR's logged [0, 0, 0] and D's wrote nothing.",
      ja: 'どのノードも初期値とトークン t0 を持って作られ、キューには何もありません。D には d > 0 のとき setR(d) を呼ぶ subscriber が、BDR にはログを取る subscriber がいます。subscribe した時点で現在の値で 1 回ずつ呼ばれ、BDR の subscriber は [0, 0, 0] を記録し、D の subscriber は何も書き込みませんでした。',
    },
  },
} as const;

/** The state the model keeps per node. */
// transformer-ignore-next-line convert-to-readonly
type SimNode = {
  readonly def: ModelNode;
  readonly children: readonly string[];
  snapshot: Value;
  updateToken: string;
  queuedFor: string | undefined;
  nextInQueue: string | undefined;
};

// transformer-ignore-next-line convert-to-readonly
type MutableModule = {
  propagationDepth: number;
  outermostToken: string | undefined;
  level: number;
  heads: (string | undefined)[];
  tails: (string | undefined)[];
};

// transformer-ignore-next-line convert-to-readonly
type MutableQueue = {
  readonly token: string;
  readonly base: number;
  readonly ownsLists: boolean;
  size: number;
  spill: (readonly string[] | undefined)[] | undefined;
  spilled: Set<string> | undefined;
};

// transformer-ignore-next-line convert-to-readonly
type MutableRun = {
  tokenCount: number;
  freshTokens: string[];
  queues: MutableQueue[];
  stack: string[];
  emitCount: Map<string, number>;
  skipped: Set<string>;
  steps: TraceStep[];
};

const showQueue = (queue: DeepReadonly<MutableQueue>): QueueState =>
  ({
    token: queue.token,
    base: queue.base,
    ownsLists: queue.ownsLists,
    size: queue.size,
    spill:
      queue.spill === undefined
        ? undefinedText
        : (`[${queue.spill.map((bucket) => (bucket === undefined ? undefinedText : `[${bucket.join(', ')}]`)).join(', ')}]` as const),
    spilled:
      queue.spilled === undefined ? undefinedText : showSet(queue.spilled),
  }) as const;

const showSet = (set: ReadonlySet<string>): string =>
  `{${Array.from(set).join(', ')}}` as const;

/** `heads = [B, undefined]`, as the caption says it. */
const listsText = (heads: readonly (string | undefined)[]): string =>
  `heads = [${heads.map((h) => h ?? undefinedText).join(', ')}]` as const;

const setterOf = (root: string): string => `set${root}` as const;

const ordinal = (n: number): string =>
  n === 2 ? 'second' : n === 3 ? 'third' : (`${n.toString()}th` as const);

const numberOf = (value: Value): number =>
  typeof value === 'number' ? value : 0;

const show = (value: Value): string =>
  typeof value === 'number'
    ? value.toString()
    : (`[${value.join(', ')}]` as const);

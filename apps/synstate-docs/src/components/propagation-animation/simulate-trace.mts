import { Arr, asUint32 } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import type { LocalizedText } from '../constants.mjs';
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
      },
    ]),
  );

  const mut_module: MutableModule = {
    propagationDepth: 0,
    outermostToken: undefined,
    level: 0,
    bucketSets: [],
  };

  const mut_run: MutableRun = {
    tokenCount: 0,
    freshTokens: [],
    queues: [],
    stack: [],
    emitCount: new Map<string, number>(),
    skipped: new Set<string>(),
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
        bucketSets: mut_module.bucketSets.map((set) =>
          set.map((bucket) => ({
            nodes: bucket.nodes.map((slot) => slot ?? undefinedText),
            length: bucket.length,
          })),
        ),
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

  const bucketsOf = (queue: DeepReadonly<MutableQueue>): MutableBuckets => {
    const buckets = mut_module.bucketSets[queue.level - 1];

    if (buckets === undefined) {
      throw new Error(`no bucket set for ${queue.token}`);
    }

    return buckets;
  };

  /** Whether `token` is the token of an update open now. */
  const isOpen = (token: string): boolean =>
    mut_run.queues.some((q) => q.token === token && q.isOpen);

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

      const mark = mut_child.queuedFor;

      const childLocal = [{ name: 'child', value: id }] as const;

      if (mark === mut_q.token) {
        record({
          code: ['sn3', 'ec1', 'ec2'],
          locals: childLocal,
          activeNode: parent,
          caption: {
            en: `child = ${id}. ${id}.queuedFor is already ${mut_q.token}: another parent has put ${id} in this update's buckets. continue — a node is queued once per update.`,
            ja: `child = ${id}。${id}.queuedFor はすでに ${mut_q.token} です。別の親が ${id} をこの更新のバケットに入れているので、continue します。1 回の更新でノードがキューに入るのは 1 回だけです。`,
          },
        });

        continue;
      }

      if (mark !== undefined && isOpen(mark)) {
        if (mut_q.queuedDespiteMark?.has(id) === true) {
          record({
            code: ['sn3', 'ec1', 'ec2', 'ec3', 'ec4'],
            locals: childLocal,
            activeNode: parent,
            caption: {
              en: `child = ${id}. ${id}.queuedFor is ${mark}, which is still open, and #queuedDespiteMark already has ${id}: continue — a node is queued once per update.`,
              ja: `child = ${id}。${id}.queuedFor はまだ開いている ${mark} で、#queuedDespiteMark にすでに ${id} があるので continue します。1 回の更新でノードがキューに入るのは 1 回だけです。`,
            },
          });

          continue;
        }

        const mut_set = mut_q.queuedDespiteMark ?? new Set<string>();

        mut_set.add(id);

        mut_q.queuedDespiteMark = mut_set;

        record({
          code: ['sn3', 'ec1', 'ec2', 'ec3', 'ec4', 'ec5'],
          locals: childLocal,
          activeNode: parent,
          caption: {
            en: `child = ${id}. ${id}.queuedFor is ${mark}, not ${mut_q.token}, and ${mark}.isOpen is true: ${mark} is still running, outside ${mut_q.token}, and has queued ${id}. ${mut_q.token} must not overwrite that mark: if it did, ${mark} would no longer see ${id} as queued, and put it in its buckets a second time should another parent of ${id} emit in ${mark}. So ${mut_q.token} leaves the mark alone and remembers ${id} in a set of its own: #queuedDespiteMark = ${showSet(mut_set)}.`,
            ja: `child = ${id}。${id}.queuedFor は ${mark} で ${mut_q.token} ではなく、${mark}.isOpen は true です。${mark} は ${mut_q.token} の外側でまだ動いていて、${id} をキューに入れています。${mut_q.token} はこの印を書き換えてはいけません。書き換えると ${mark} は ${id} を入れたことが分からなくなり、${id} の別の親が ${mark} で発行したときに、もう一度バケットに入れてしまいます。そこで印はそのままにして、${mut_q.token} 自身の集合に覚えます：#queuedDespiteMark = ${showSet(mut_set)}。`,
          },
        });
      } else {
        mut_child.queuedFor = mut_q.token;

        record({
          code: ['sn3', 'ec1', 'ec2', 'ec3', 'ec6'],
          locals: childLocal,
          activeNode: parent,
          caption:
            mark === undefined
              ? {
                  en: `child = ${id}. ${id}.queuedFor is undefined: ${id} has never been queued. So ${mut_q.token} marks it, ${id}.queuedFor = ${mut_q.token}, which is how it will know it has queued ${id}.`,
                  ja: `child = ${id}。${id}.queuedFor は undefined で、${id} はまだ一度もキューに入ったことがありません。そこで ${mut_q.token} が印を付けます：${id}.queuedFor = ${mut_q.token}。これで ${mut_q.token} は ${id} を入れ済みだと分かります。`,
                }
              : {
                  en: `child = ${id}. ${id}.queuedFor is ${mark}, not ${mut_q.token}, and ${mark} has closed (isOpen is false): the mark is left over from an update that has ended, and means nothing now. So it is overwritten: ${id}.queuedFor = ${mut_q.token}. No mark is ever cleared: closing ${mark} is what made its marks stale.`,
                  ja: `child = ${id}。${id}.queuedFor は ${mark} で ${mut_q.token} ではなく、${mark} は閉じています（isOpen が false）。終わった更新が残した印で、もう意味はありません。そこで上書きします：${id}.queuedFor = ${mut_q.token}。印は一度も消しません。${mark} が閉じたことで、その印が無効になったのです。`,
                },
        });
      }

      push(id, parent);
    }

    mut_run.stack.pop();
  };

  /** `UpdateQueue.#push`. */
  const push = (id: string, parent: string): void => {
    const mut_q = queueOf();

    const mut_buckets = bucketsOf(mut_q);

    const index = nodeOf(id).def.depth - mut_q.base;

    const grows = index >= mut_q.size;

    const sizeBefore = mut_q.size;

    if (grows) {
      mut_q.size = index + 1;
    }

    const made = mut_buckets.length <= index;

    while (mut_buckets.length <= index) {
      mut_buckets.push({ nodes: [], length: 0 });
    }

    const mut_bucket = mut_buckets[index] ?? { nodes: [], length: 0 };

    const length = mut_bucket.length;

    const reused = length < mut_bucket.nodes.length;

    mut_bucket.nodes[length] = id;

    mut_bucket.length = length + 1;

    const i = index.toString();

    const n = length.toString();

    const sizeText: LocalizedText = grows
      ? ({
          en: `index ≥ size (${sizeBefore.toString()}), so size = ${mut_q.size.toString()}`,
          ja: `index ≥ size（${sizeBefore.toString()}）なので size = ${mut_q.size.toString()}`,
        } as const)
      : ({
          en: `index < size (${mut_q.size.toString()}), so size stays`,
          ja: `index < size（${mut_q.size.toString()}）なので size はそのまま`,
        } as const);

    const slotText: LocalizedText = made
      ? ({
          en: `buckets[${i}] did not exist yet, so it is made, { nodes: [], length: 0 }; it stays for every later update at this level`,
          ja: `buckets[${i}] はまだないので、{ nodes: [], length: 0 } を作ります。以後この段の更新はずっとこれを使います`,
        } as const)
      : reused
        ? ({
            en: `slot ${n} of buckets[${i}].nodes already exists, left undefined by an earlier update: it is written over, and nothing is allocated`,
            ja: `buckets[${i}].nodes のスロット ${n} は前の更新が undefined にして残したもので、そこに上書きするので何も確保しません`,
          } as const)
        : ({
            en: `buckets[${i}].nodes has never held ${(length + 1).toString()} nodes, so it grows by one slot`,
            ja: `buckets[${i}].nodes が ${(length + 1).toString()} 個を持つのは初めてなので、スロットが 1 つ増えます`,
          } as const);

    record({
      code: ['ec7', 'ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'ps6'],
      locals: [
        { name: 'child', value: id },
        { name: 'index', value: i },
        { name: 'length', value: n },
      ],
      activeNode: parent,
      caption: {
        en: `#push(${id}): index = ${id}.depth − base = ${nodeOf(id).def.depth.toString()} − ${mut_q.base.toString()} = ${i}; ${sizeText.en}. bucket = buckets[${i}], whose length is ${n}; ${slotText.en}. bucket.nodes[${n}] = ${id}, and bucket.length = ${(length + 1).toString()}.`,
        ja: `#push(${id})：index = ${id}.depth − base = ${nodeOf(id).def.depth.toString()} − ${mut_q.base.toString()} = ${i}。${sizeText.ja}。bucket = buckets[${i}] で、その length は ${n}。${slotText.ja}。bucket.nodes[${n}] = ${id}、bucket.length = ${(length + 1).toString()} とします。`,
      },
    });
  };

  /**
   * `setNext`: stores the value and the token, queues the children, and calls
   * the subscriber.
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

    const outerSet = `bucketSets[${(outer.level - 1).toString()}]` as const;

    record({
      code: ['sn4'],
      activeNode: id,
      caption: {
        en: `${call} has returned to ${id}'s subscriber, and ${outer.token} carries on where it was. ${outer.token}'s buckets, ${outerSet}, were never touched: ${bucketsText(bucketsOf(outer))}. The marks it set are still ${outer.token}.`,
        ja: `${call} が ${id} の subscriber に戻り、${outer.token} は中断したところから続けます。${outer.token} のバケット ${outerSet} には一度も触れていません：${bucketsText(bucketsOf(outer))}。${outer.token} が付けた印も ${outer.token} のままです。`,
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

  /** `UpdateQueue.drain`, with the end of each bucket told in the next step. */
  const drain = (): void => {
    const mut_q = queueOf();

    const token = mut_q.token;

    const mut_buckets = bucketsOf(mut_q);

    mut_run.stack.push(`drainUpdate(${token})`);

    let mut_endOfBucket: LocalizedText = { en: '', ja: '' };

    let mut_markTold = false;

    // `size` grows while the buckets are visited, which a `range` built at the
    // start would miss.
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_index = 0; mut_index < mut_q.size; mut_index += 1) {
      const i = mut_index.toString();

      const depth = (mut_q.base + mut_index).toString();

      const mut_bucket = mut_buckets[mut_index] ?? { nodes: [], length: 0 };

      const length = mut_bucket.length;

      const n = length.toString();

      record({
        code: [
          ...(mut_index === 0
            ? (['su4', 'dr1'] as const)
            : (['dr8', 'dr9', 'dr10'] as const)),
          'dr2',
          'dr3',
        ],
        locals: [
          { name: 'index', value: i },
          { name: 'length', value: n },
        ],
        caption: {
          en: `${mut_endOfBucket.en}index = ${i} < size (${mut_q.size.toString()}): bucket = buckets[${i}], the bucket of depth base + index = ${depth}, and its length is ${n}${length === 0 ? ': nothing was queued at this depth' : ''}.`,
          ja: `${mut_endOfBucket.ja}index = ${i} < size（${mut_q.size.toString()}）：bucket = buckets[${i}] は深さ base + index = ${depth} のバケットで、その length は ${n}${length === 0 ? '。この深さには何も入っていません' : ''}。`,
        },
      });

      for (const slot of Arr.seq(asUint32(length))) {
        const id = mut_bucket.nodes[slot] ?? undefinedText;

        mut_bucket.nodes[slot] = undefined;

        const s = slot.toString();

        const mark: LocalizedText = mut_markTold
          ? ({ en: '', ja: '' } as const)
          : ({
              en: ` ${id}.queuedFor stays ${nodeOf(id).queuedFor ?? undefinedText}: a mark is never cleared.`,
              ja: `${id}.queuedFor は ${nodeOf(id).queuedFor ?? undefinedText} のままです。印は消しません。`,
            } as const);

        mut_markTold = true;

        record({
          code: ['dr4', 'dr5', 'dr6'],
          locals: [
            { name: 'index', value: i },
            { name: 'length', value: n },
            { name: 'slot', value: s },
            { name: 'node', value: id },
          ],
          activeNode: id,
          caption: {
            en: `slot = ${s} < length (${n}): node = bucket.nodes[${s}] = ${id}, and the slot is set back to undefined, so that it keeps no reference to ${id}.${mark.en}`,
            ja: `slot = ${s} < length（${n}）：node = bucket.nodes[${s}] = ${id} とし、スロットを undefined に戻します。スロットが ${id} を参照し続けないためです。${mark.ja}`,
          },
        });

        tryUpdate(id, 'dr7');
      }

      mut_bucket.length = 0;

      mut_endOfBucket = {
        en: `slot = ${n} is not < length (${n}), so bucket.length = 0: the bucket is empty again, and its nodes array keeps its slots for the next update. `,
        ja: `slot = ${n} は length（${n}）未満ではないので、bucket.length = 0 にします。バケットは空に戻り、nodes 配列のスロットは次の更新のために残ります。`,
      };
    }

    const size = mut_q.size;

    mut_q.size = 0;

    record({
      code: ['dr8', 'dr9', 'dr10', 'dr2', 'dr11'],
      locals: [{ name: 'index', value: size.toString() }],
      caption: {
        en: `${mut_endOfBucket.en}index = ${size.toString()} is not < size (${size.toString()}): every bucket has been visited. size = 0.`,
        ja: `${mut_endOfBucket.ja}index = ${size.toString()} は size（${size.toString()}）未満ではないので、すべてのバケットを訪れました。size = 0 にします。`,
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

    // The captions below narrate the update a write opens; a write to a root
    // nothing observes (`setNextIfUnobserved`) opens none, which this simulator
    // does not model.
    if (Arr.isEmpty(root.children)) {
      throw new Error(
        `❌ ${rootId} has no children: the trace does not model a write that opens no update`,
      );
    }

    const depth = root.def.depth;

    const outer = mut_run.queues.at(-1);

    mut_run.stack.push(call, `${rootId}.startUpdate(${input.toString()})`);

    mut_module.level += 1;

    const level = mut_module.level;

    const setIndex = (level - 1).toString();

    const reused = mut_module.bucketSets[level - 1] !== undefined;

    if (!reused) {
      mut_module.bucketSets[level - 1] = [];
    }

    mut_run.queues.push({
      token,
      base: depth + 1,
      level,
      size: 0,
      isOpen: true,
      queuedDespiteMark: undefined,
    });

    mut_run.stack.push(`openUpdate(${depth.toString()})`);

    const setText: LocalizedText = reused
      ? ({
          en: `bucketSets[${setIndex}] is left from the previous update at this level and is reused as it is: every bucket's length is 0, so it is empty, though their nodes arrays keep their slots.`,
          ja: `bucketSets[${setIndex}] はこの段の前の更新が残したもので、そのまま使い回します。どのバケットも length が 0 なので、nodes 配列にスロットが残っていても空です。`,
        } as const)
      : ({
          en: `bucketSets[${setIndex}] does not exist yet, so it is made empty — the only time it is; every later update at level ${level.toString()} reuses it.`,
          ja: `bucketSets[${setIndex}] はまだないので、空で作ります。作るのはこの 1 回だけで、以後 level ${level.toString()} の更新はずっとこれを使い回します。`,
        } as const);

    record({
      code: ['suu', 'su1', 'ou1', 'ou2', 'ou3'],
      locals: [{ name: 'depth', value: depth.toString() }],
      activeNode: rootId,
      caption:
        outer === undefined
          ? {
              en: `${call} calls ${rootId}.next(${input.toString()}). ${rootId} has children, so setNextIfUnobserved stores nothing and returns false: the write starts an update. openUpdate raises level to 1 and takes the bucket set of that level. ${setText.en} The UpdateQueue ${token} gets base = ${rootId}.depth + 1 = ${(depth + 1).toString()}, so bucket 0 holds depth ${(depth + 1).toString()}. ${token} is the update's token and its queue at once.`,
              ja: `${call} は ${rootId}.next(${input.toString()}) を呼びます。${rootId} には子があるので、setNextIfUnobserved は何も保存せず false を返し、書き込みは更新を始めます。openUpdate は level を 1 に上げ、その段のバケットの組を取ります。${setText.ja}UpdateQueue ${token} は base = ${rootId}.depth + 1 = ${(depth + 1).toString()} で、バケット 0 は深さ ${(depth + 1).toString()} です。${token} はこの更新のトークンであり、同時にキューでもあります。`,
            }
          : {
              en: `${call} calls ${rootId}.next(${input.toString()}). propagation.depth > 0, so ${rootId} warns once that it was written to during an update. It has children, so setNextIfUnobserved returns false, and it starts an update anyway. openUpdate raises level to ${level.toString()}: ${outer.token} still uses bucketSets[${(outer.level - 1).toString()}], so ${token} takes the next set. ${setText.en} ${token} gets base = ${(depth + 1).toString()}.`,
              ja: `${call} は ${rootId}.next(${input.toString()}) を呼びます。propagation.depth > 0 なので、${rootId} は更新中に書き込まれたことを一度だけ警告します。子があるので setNextIfUnobserved は false を返し、そのうえで更新を始めます。openUpdate は level を ${level.toString()} に上げます。${outer.token} が bucketSets[${(outer.level - 1).toString()}] を使っているので、${token} は次の組を取ります。${setText.ja}${token} は base = ${(depth + 1).toString()} です。`,
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
            ja: `beginPropagation：伝搬中の更新はなかった（depth 0）ので outermostToken = ${token}、depth = 1 にします。depth > 0 の間にルートへ書き込むと、伝搬中の書き込みとして一度だけ警告が出ます。`,
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

    const mut_q = queueOf();

    const despite = mut_q.queuedDespiteMark;

    mut_q.isOpen = false;

    mut_q.queuedDespiteMark = undefined;

    mut_module.level -= 1;

    record({
      code: ['su5', 'cu1', 'cl1', 'cl2', 'cu2'],
      caption: {
        en: `closeUpdate: drain left size 0 and every bucket's length 0, so close has no slot to empty (it would, had a tryUpdate thrown). isOpen = false: from now on the marks ${token} left are stale, and any update may overwrite them. #queuedDespiteMark is dropped${despite === undefined ? ' (it was never needed)' : `, ${showSet(despite)} with it`}. level = ${mut_module.level.toString()}.`,
        ja: `closeUpdate：drain が size と長さをすべて 0 にしたので、close が空にするスロットはありません（tryUpdate が例外を投げた場合に働きます）。isOpen = false にします。これで ${token} が残した印は無効になり、どの更新も上書きできます。#queuedDespiteMark は${despite === undefined ? '（一度も使わなかったので undefined のまま）' : ` ${showSet(despite)} ごと`}捨てます。level = ${mut_module.level.toString()} にします。`,
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
        en: `${call} has returned. ${emittedText} emitted; ${Arr.isEmpty(skipped) ? 'no node was visited without emitting' : `${skipped.join(', ')} was visited and did not emit`}${Arr.isNonEmpty(unreached) ? `, and ${unreached.join(', ')} was never reached` : ''}. Every bucket's length is 0 and no update is open. ${stamped.map((s) => `${s.token} lives on as the updateToken of ${s.nodes.join(', ')}`).join(', and ')}; the marks in queuedFor stay too, and the next update, finding their updates closed, overwrites them.`,
        ja: `${call} が戻りました。${emittedText.replaceAll(', ', '、')} が発行し、${Arr.isEmpty(skipped) ? '訪れて発行しなかったノードはありません' : `${skipped.join('、')} は訪れたものの発行しませんでした`}${Arr.isNonEmpty(unreached) ? `。${unreached.join('、')} には更新が届いていません` : ''}。バケットの length はすべて 0 で、開いている更新はありません。${stamped.map((s) => `${s.token} は ${s.nodes.join('、')} の updateToken として残ります`).join('。')}。queuedFor の印も残りますが、次の更新はその更新が閉じていることを見て上書きします。`,
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
                en: `Where the previous update left things: ${before.nodes.map((n) => `${n.id} holds ${n.snapshot} (${n.updateToken})`).join(', ')}. bucketSets[0] keeps its buckets, every slot undefined and every length 0. The queuedFor marks are those of closed updates. Next: ${call}.`,
                ja: `前の更新が終わった状態です：${before.nodes.map((n) => `${n.id} は ${n.snapshot}（${n.updateToken}）`).join('、')}。bucketSets[0] はバケットを持ったままで、スロットはすべて undefined、length はすべて 0 です。queuedFor の印は閉じた更新のものです。次は ${call} です。`,
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
  ['suu', '  if (this.setNextIfUnobserved(nextValue)) return;'],
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
  ['ou2', '  const buckets = (bucketSets[queueState.level - 1] ??= []);'],
  [
    'ou3',
    '  return new UpdateQueue(depth + 1, buckets); // #size 0, #isOpen true',
  ],
  ['ou4', '}'],
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
  [
    'h4',
    '// class UpdateQueue: #base, #buckets, #size, #isOpen, #queuedDespiteMark',
  ],
  ['ec0', 'enqueueChildren(children) {'],
  ['ec1', '  for (const child of children) {'],
  ['ec2', '    if (child.queuedFor === this) continue;'],
  ['ec3', '    if (child.queuedFor?.isOpen) {'],
  ['ec4', '      if (this.#queuedDespiteMark?.has(child)) continue;'],
  ['ec5', '      (this.#queuedDespiteMark ??= new Set()).add(child);'],
  ['ec6', '    } else child.queuedFor = this;'],
  ['ec7', '    this.#push(child);'],
  ['ec8', '  }'],
  ['ec9', '}'],
  ['ps0', '#push(child) {'],
  ['ps1', '  const index = child.depth - this.#base;'],
  ['ps2', '  if (index >= this.#size) this.#size = index + 1;'],
  [
    'ps3',
    '  const bucket = this.#buckets[index]; // { nodes: [], length: 0 } if missing',
  ],
  ['ps4', '  const length = bucket.length;'],
  ['ps5', '  bucket.nodes[length] = child;'],
  ['ps6', '  bucket.length = length + 1;'],
  ['ps7', '}'],
  ['dr0', 'drain() {'],
  ['dr1', '  const buckets = this.#buckets;'],
  ['dr2', '  for (let index = 0; index < this.#size; index += 1) {'],
  ['dr3', '    const { nodes, length } = buckets[index];'],
  ['dr4', '    for (let slot = 0; slot < length; slot += 1) {'],
  ['dr5', '      const node = nodes[slot];'],
  ['dr6', '      nodes[slot] = undefined;'],
  ['dr7', '      if (!node.isCompleted) node.tryUpdate(this);'],
  ['dr8', '    }'],
  ['dr9', '    buckets[index].length = 0;'],
  ['dr10', '  }'],
  ['dr11', '  this.#size = 0;'],
  ['dr12', '}'],
  ['cl0', 'close() {'],
  [
    'cl1',
    '  for (let index = 0; index < this.#size; index += 1) { /* empty what a throw left */ }',
  ],
  ['cl2', '  this.#isOpen = false; this.#queuedDespiteMark = undefined;'],
  ['cl3', '}'],
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
   * The filter diamond of "How SynState Solved the Glitch", with `combine` and
   * the `map` after it as the two nodes they are.
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
      en: 'Every node was created with its initial value and the token t0 (notUpdatedYet). No update has run yet: queuedFor is undefined everywhere, and there is no bucket set.',
      ja: 'どのノードも初期値と、トークン t0（notUpdatedYet）を持って作られています。まだ更新は一度も走っていないので、queuedFor はすべて undefined で、バケットの組もありません。',
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
};

type MutableModule = {
  propagationDepth: number;
  outermostToken: string | undefined;
  level: number;
  bucketSets: MutableBuckets[];
};

type MutableBuckets = MutableBucket[];

type MutableBucket = {
  readonly nodes: (string | undefined)[];
  length: number;
};

type MutableQueue = {
  readonly token: string;
  readonly base: number;
  /** The nesting level, 1 for the outermost: its bucket set is `level - 1`. */
  readonly level: number;
  size: number;
  isOpen: boolean;
  queuedDespiteMark: Set<string> | undefined;
};

type MutableRun = {
  tokenCount: number;
  freshTokens: string[];
  queues: MutableQueue[];
  stack: string[];
  emitCount: Map<string, number>;
  skipped: Set<string>;
  steps: TraceStep[];
};

const showSet = (set: ReadonlySet<string>): string =>
  `{${Array.from(set).join(', ')}}` as const;

const showQueue = (queue: DeepReadonly<MutableQueue>): QueueState =>
  ({
    token: queue.token,
    base: queue.base,
    buckets: `bucketSets[${(queue.level - 1).toString()}]`,
    size: queue.size,
    isOpen: queue.isOpen,
    queuedDespiteMark:
      queue.queuedDespiteMark === undefined
        ? undefinedText
        : showSet(queue.queuedDespiteMark),
  }) as const;

/** `[{ nodes: [undefined, undefined], length: 2 }, { nodes: [BDR], length: 1 }]`. */
const bucketsText = (buckets: DeepReadonly<MutableBuckets>): string =>
  `[${buckets.map((bucket) => `{ nodes: [${bucket.nodes.map((slot) => slot ?? undefinedText).join(', ')}], length: ${bucket.length.toString()} }`).join(', ')}]` as const;

const setterOf = (root: string): string => `set${root}` as const;

const ordinal = (n: number): string =>
  n === 2 ? 'second' : n === 3 ? 'third' : (`${n.toString()}th` as const);

const numberOf = (value: Value): number =>
  typeof value === 'number' ? value : 0;

const show = (value: Value): string =>
  typeof value === 'number'
    ? value.toString()
    : (`[${value.join(', ')}]` as const);

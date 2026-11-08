---
title: Tracing an update
description: The fields synstate-next's scheduler reads and writes, step by step, through two updates of the filter diamond and a write made from an effect.
---

[How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/) described the phases. This page follows the scheduler (`src/core/scheduler.mts`) through two updates of one graph, field by field.

## The graph

```tsx
import { combine, createState, filter, map } from 'synstate-next';

const [A, setA] = createState(0);

const B = A.pipe(map((n) => n * 10)); // depth 1

const D = A.pipe(filter((n) => n % 2 === 0)); // depth 1

const BD = combine([B, D]); // depth 2

const C = BD.pipe(map(([b, d]) => b + d)); // depth 3

const E = D.pipe(map((n) => n * 10)); // depth 2

const mut_seen: number[] = [];

C.subscribe((c) => {
    mut_seen.push(c);
});

setA(1); // B = 10, BD = [10, 0], C = 10; D rejects 1, so E is not reached

setA(2); // B = 20, D = 2, BD = [20, 2], E = 20, C = 22

assert.deepStrictEqual(mut_seen, [0, 10, 22]);

assert.strictEqual(E.peek(), 20);
```

The depths are as the comments say: `A` is a state at depth 0, `B` and `D` follow it, `BD` follows both, `C` follows `BD`, `E` follows `D`. The subscriber of `C` is an effect.

## Where the state lives

| Where      | Field                            | What it holds                                                                                       |
| :--------- | :------------------------------- | :-------------------------------------------------------------------------------------------------- |
| scheduler  | `epoch`                          | The number of the current round. One more for each round.                                           |
|            | `phase`                          | `idle`, `drain`, `effects`, or `settle` (applying deferred writes once the effects ran).            |
|            | `pending`                        | The nodes that emitted outside the drain (a write), waiting for the next round.                     |
|            | `buckets[d]`, `bucketLengths[d]` | The queued nodes of depth `d`, and how many slots of that bucket are in use.                        |
|            | `minDepth`, `maxDepth`           | The range of buckets that hold a node; the drain loops over it, and `maxDepth` grows while it does. |
|            | `effects`                        | The effects queued in this round, in the order they were reached.                                   |
|            | `deferred`                       | The writes made during the drain, applied in order once the effects ran.                            |
|            | `writeCount`                     | The number of emissions so far.                                                                     |
| every node | `depth`                          | One more than its deepest parent's.                                                                 |
|            | `queuedAt`                       | The epoch it was last queued for; a negative number while it is pending.                            |
|            | `changedAt`                      | The epoch it last emitted in.                                                                       |
|            | `bornAt`, `emittedAt`            | The `writeCount` at its creation and at its latest emission.                                        |

## Update 1: `setA(1)`, an odd value

1. `A.set(1)` changes `A`'s value. `A` has children, so it is stamped (`writeCount` 1, `A.emittedAt = 1`) and put in `pending` with `queuedAt` set to the pending mark. The phase is `idle` and no batch is open, so the flush starts.
2. The round begins: `epoch` becomes, say, 2. `A.changedAt = 2`, and `A`'s children are queued: `B.queuedAt = 2` into `buckets[1]`, `D.queuedAt = 2` into `buckets[1]`. `minDepth = maxDepth = 1`.
3. **Drain, depth 1.** `B` recomputes `10`, which differs from `0`: `B.changedAt = 2`, and `BD` is queued into `buckets[2]` (`maxDepth = 2`). `D` recomputes: `1` is odd, so it returns `false`. `D` keeps `0`, its children are not queued, and `E` is never touched.
4. **Drain, depth 2.** `BD` recomputes. It reads both parents' values, `[10, 0]`; `combine` never compares, so it emits and queues `C` into `buckets[3]`.
5. **Drain, depth 3.** `C` recomputes `10`, emits, and queues its effect: the subscriber goes into `effects` with `queuedAt = 2`.
6. **Effects.** The subscriber runs and reads `10`. `bucketLengths` are all 0 again, and each slot the drain took a node out of was set back to `undefined`, so no bucket keeps a node alive.

## Update 2: `setA(2)`, an even value

1. The same steps start round 3. `B` and `D` are queued in `buckets[1]`, writing over the slots update 1 left empty: no array is allocated.
2. `B` recomputes `20` and queues `BD` (`BD.queuedAt = 3`). `D` recomputes `2` and emits; it queues `BD` too, but `BD.queuedAt` is already 3, so `BD` is not queued twice. `E` goes into `buckets[2]`.
3. Depth 2: `BD` gives `[20, 2]` and queues `C`; `E` gives `20`, which has no children.
4. Depth 3: `C` gives `22`. The effect runs and reads `22`.

That one comparison of `queuedAt` with the epoch is what keeps a node with two parents from being visited twice, and it costs one integer compare.

## A write from an effect

Suppose the subscriber of `C` writes to another state, `R`. The write happens in the `effects` phase. `R` is stamped and put in `pending`, but the flush is already running, so nothing else happens until the round's other effects have run. Then the loop sees `pending` is not empty and starts round 4: a new epoch, `R`'s children queued, a drain, effects. The round counter goes up by one; a program whose effects write in every round is stopped at 100.

A write made in the **drain** instead (from inside a `map`) goes to `deferred`: the drain is not interrupted, and the write is applied once the effects have run, in order with any other deferred write. Applying it puts `R` in `pending`, and the next round propagates it.

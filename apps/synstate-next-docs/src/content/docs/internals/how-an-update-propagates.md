---
title: How an update propagates
description: An update is a number. The derived values it reaches are recomputed by depth, each once; the effects run after that, once every value is up to date; writes made on the way wait for their turn.
---

This page follows one update from the write that starts it to the last subscriber it calls. [Tracing an update](/mono/synstate-next/internals/tracing-an-update/) then goes through the same steps field by field.

## Two phases

An update runs in two phases:

1. **Recomputing**: the derived nodes the update reaches are recomputed, in order of depth, each once, after all of its parents.
2. **The effects** run, in the order they were queued, once every value is up to date. An effect is what runs after the values: subscribers are effects, and so are synstate-dom-next's bindings.

```tsx
import { createState, derive, map } from 'synstate-next';

const mut_log: string[] = [];

const [a, setA] = createState(1);

const b = a.pipe(
    map((x) => {
        mut_log.push(`compute b from a = ${x}`);

        return x + 1;
    }),
);

const c = derive([a, b], (x, y) => {
    mut_log.push(`compute c from a = ${x}, b = ${y}`);

    return x + y;
});

a.subscribe((x) => {
    mut_log.push(`effect of a: a = ${x}, c = ${c.value}`);
});

c.subscribe((x) => {
    mut_log.push(`effect of c: c = ${x}`);
});

const start = mut_log.length;

setA(2);

assert.deepStrictEqual(mut_log.slice(start), [
    // Recomputing: each node once, after its parents.
    'compute b from a = 2',
    'compute c from a = 2, b = 3',
    // The effects, every value up to date: a's effect already sees the new c.
    'effect of a: a = 2, c = 5',
    'effect of c: c = 5',
]);
```

The effect of `a` is queued first, but it runs after `c` has been recomputed, so it reads the new `c`. In synstate a subscriber of `a` would have run as soon as `a` changed, and read the old one.

<figure>
<svg viewBox="0 0 720 230" role="img" aria-label="The phases of one update: a write waits for its update; depth 1, 2 and 3 are recomputed; the effects run; deferred writes and effect writes start the next update." style="width:100%;height:auto;font:13px var(--sl-font, sans-serif)">
  <defs>
    <marker id="arrow-phases" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="10" y="40" width="110" height="60" rx="8"/>
    <rect x="160" y="20" width="300" height="100" rx="8" stroke="var(--sl-color-accent)"/>
    <rect x="500" y="40" width="100" height="60" rx="8" stroke="var(--sl-color-accent)"/>
    <rect x="175" y="60" width="80" height="44" rx="6"/>
    <rect x="270" y="60" width="80" height="44" rx="6"/>
    <rect x="365" y="60" width="80" height="44" rx="6"/>
    <path d="M120,70 H158" marker-end="url(#arrow-phases)"/>
    <path d="M255,82 H268" marker-end="url(#arrow-phases)"/>
    <path d="M350,82 H363" marker-end="url(#arrow-phases)"/>
    <path d="M460,70 H498" marker-end="url(#arrow-phases)"/>
    <path d="M550,100 V170 H65 V102" stroke-dasharray="5 4" marker-end="url(#arrow-phases)"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="65" y="66">setA(2)</text>
    <text x="65" y="84" font-size="11">waiting</text>
    <text x="310" y="42" font-weight="bold">recompute</text>
    <text x="215" y="80">depth 1</text>
    <text x="215" y="96" font-size="11">recompute</text>
    <text x="310" y="80">depth 2</text>
    <text x="310" y="96" font-size="11">recompute</text>
    <text x="405" y="80">depth 3</text>
    <text x="405" y="96" font-size="11">recompute</text>
    <text x="550" y="66" font-weight="bold">effects</text>
    <text x="550" y="84" font-size="11">in queue order</text>
    <text x="310" y="190">writes deferred while recomputing, and writes made by effects:</text>
    <text x="310" y="208">the next update (at most 100 in a row)</text>
  </g>
</svg>
</figure>

## An update is a number

The scheduler keeps one integer, the **update number** (`epoch` in the code), and adds one for each update, and for each write that nothing observes. Each node has two integer fields that it is compared with:

- `queuedAt` equals the update number when the node is queued for this update. Queueing a child writes the update number there, so a child that two parents reach is queued once, by whichever comes first, and nothing is allocated.
- `changedAt` equals the update number when the node emitted in this update. A node with several parents asks which of them did; a node with one parent knows that its parent did, since that is the only way it can have been queued.

## Depth buckets

A node's depth is one more than its deepest parent's. The queue is an array of buckets, one per depth, each with a counter of how many of its slots are in use. Recomputing goes through the buckets from the shallowest that holds a node to the deepest. A node that emits queues its children in deeper buckets only, so the bucket being visited never grows while it is visited, and every node is visited after all of its parents: no glitch, diamonds included.

<figure>
<svg viewBox="0 0 720 220" role="img" aria-label="A graph laid out by depth: A at depth 0; B and D at depth 1; BD and E at depth 2; C at depth 3; a subscriber of C as an effect." style="width:100%;height:auto;font:13px var(--sl-font, sans-serif)">
  <defs>
    <marker id="arrow-depth" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
  </defs>
  <g fill="currentColor" text-anchor="middle" font-size="11" opacity="0.7">
    <text x="60" y="20">depth 0</text>
    <text x="210" y="20">depth 1</text>
    <text x="360" y="20">depth 2</text>
    <text x="510" y="20">depth 3</text>
    <text x="650" y="20">effects</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M135,30 V210 M285,30 V210 M435,30 V210 M585,30 V210" stroke-dasharray="3 5" opacity="0.4"/>
    <circle cx="60" cy="115" r="22"/>
    <circle cx="210" cy="65" r="22"/>
    <circle cx="210" cy="165" r="22"/>
    <circle cx="360" cy="65" r="22"/>
    <circle cx="360" cy="165" r="22"/>
    <circle cx="510" cy="65" r="22"/>
    <rect x="615" y="45" width="70" height="40" rx="6" stroke="var(--sl-color-accent)"/>
    <path d="M80,105 L188,72" marker-end="url(#arrow-depth)"/>
    <path d="M80,125 L188,158" marker-end="url(#arrow-depth)"/>
    <path d="M232,65 H336" marker-end="url(#arrow-depth)"/>
    <path d="M228,152 L340,78" marker-end="url(#arrow-depth)"/>
    <path d="M232,165 H336" marker-end="url(#arrow-depth)"/>
    <path d="M382,65 H486" marker-end="url(#arrow-depth)"/>
    <path d="M532,65 H613" stroke-dasharray="5 4" marker-end="url(#arrow-depth)"/>
  </g>
  <g fill="currentColor" text-anchor="middle" dominant-baseline="central">
    <text x="60" y="115">A</text>
    <text x="210" y="65">B</text>
    <text x="210" y="165">D</text>
    <text x="360" y="65">BD</text>
    <text x="360" y="165">E</text>
    <text x="510" y="65">C</text>
    <text x="650" y="65" font-size="11">subscriber</text>
  </g>
</svg>
</figure>

An update costs what it reaches: each queued node is visited once, and a node that is not reached is not touched. A priority queue would give the same order at a logarithmic cost per node; buckets indexed by depth give it at a constant one.

## Stopping where a value does not change

A node's `recompute` returns whether it emits. A node that computes a value (`map`, `derive`, `keepEqualParts`, a state's write, and `switchMap` when it switches) returns `false` when the value is equal to the one it holds, and its children are not queued: nothing below it is visited. The operators that pass values on (`filter`, `take`, `skip`, …) pass what reached them, which a parent upstream has already found to be a change. `combine` and the operators that pass events (`merge`, `zip`, `scan`, `pairwise`, the time operators) never compare: a repeated event is still an event.

## Effects run after the values

A node that emits queues its effects in one list, in the order they were reached, and they wait there while the values are recomputed. Once the deepest bucket is done, the effects run. Each one finds every node of the graph up to date, so it may read any of them. An effect that throws does not stop the others of its update, nor the next update: what they write still propagates, so one failing binding does not leave the rest of the page behind the state, and the exception is thrown once the updates that follow have all run. Something that keeps throwing may keep writing, so an effect that throws in a later update as well ends them at once, as an exception from a node does; what was still queued is dropped, and the first exception is thrown.

## Writes that come during an update

A write made **while values are recomputed**, from inside a `map` say, would change a node that may already have been visited. It is deferred until the update's effects have run, and applied then, in order, so the effects of this update still see the old value and the write starts the next update:

```tsx
import { createState, map } from 'synstate-next';

const [a, setA] = createState(0);

const [b, setB] = createState(0);

const mut_log: string[] = [];

// A write from inside a derivation, shown only for the order: derive the
// value instead.
const watched = a.pipe(
    map((x) => {
        setB(x * 10);

        mut_log.push(`b = ${b.value} right after setB(${x * 10})`);

        return x;
    }),
);

watched.subscribe(() => {
    mut_log.push(`b = ${b.value} in the effects`);
});

const start = mut_log.length;

setA(1);

// The write waits, and the effects of this update still see the old value.
assert.deepStrictEqual(mut_log.slice(start), [
    'b = 0 right after setB(10)',
    'b = 0 in the effects',
]);

// Applied after the effects, it started the next update.
assert.strictEqual(b.value, 10);
```

A write made **by an effect** is the start of the next update. Updates never nest: the next update runs after this one's effects have all run, with a number of its own. A program whose effects or operators keep writing to what their own update reaches is stopped after 100 updates in a row, with an error that names the cause.

A write made outside any update starts an update at once, unless a `batch` is open: then the update starts when the outermost batch returns. A state written twice before its update is queued once, and the update reads the value it holds by then.

## A node sees what happens after it was created

Each emission is numbered, and a node records the number current at its creation. An emission made before that reaches it only as the value its parent holds. A subscriber or a `take` made in the batch that wrote its source therefore does not count the written value twice: it read the value when it was created, and the emission that wrote it came before.

## Why this is faster than synstate

- **Nothing is allocated per update.** An update is an integer, and the queues are arrays that keep their length in a counter: emptying one does not drop its backing store, so the next update reuses it.
- **A node with one parent asks nothing.** Being queued means its parent emitted.
- **Stopping at an unchanged value is the default.** Every node that computes a value compares it, so an update stops at the first one that does not change.
- **Updates never nest.** A write from a subscriber is an update of its own, after this one's effects, instead of a second update opened inside the first one with buckets of its own.
- **Nodes are classes.** The methods live on a prototype, and each operator is a subclass that overrides `recompute`; a node is its fields.

The measurements are in [BENCHMARK.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-next/BENCHMARK.md), written by `pnpm run benchmark` in `libs/synstate-next`.

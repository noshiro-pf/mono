# synstate formal verification (Lean 4)

Machine-checked proofs about synstate's synchronous propagation core.

Since the implementation is TypeScript, the proofs are about an **executable
Lean model** of the core algorithm, kept line-by-line faithful to the
implementation (each model function cites the `.mts` source it mirrors).
The model ↔ implementation correspondence is validated by **compile-time
conformance checks** (`#guard`) that replay the vitest suite's scenarios and
expected outputs against the model — the unit tests' intent, checked against
the same semantics the theorems are about.

## Build

```sh
# once: install elan (Lean toolchain manager), https://leanprover-community.github.io/get_started.html
cd formal
lake build   # compiles the model, all proofs, and all #guard conformance checks
```

No external Lean dependencies (core Lean only, no mathlib). Toolchain is
pinned in `lean-toolchain`.

## What is proven

### Candidate 1 — glitch-freedom of depth-ordered propagation

| Theorem (`SynstateFormal/GlitchFree.lean`)                            | Statement                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `orderedInsert_pairwise` / `propagationOrder_sorted` (`Sorting.lean`) | `addDescendant`'s sorted insertion keeps `#mut_propagationOrder` depth-sorted; the propagation order contains every child node exactly once.                                                                                                           |
| `foldl_split_at_member`                                               | **The core argument**: when a node's `tryUpdate` runs during a wave, every strictly shallower node — in particular every parent — has already reached its final state for this wave.                                                                   |
| `consistent_wave`                                                     | If every `map`/`combine` node's value equals its operator applied to its parents' current values before a wave, the same holds after the wave. A `combine` holding a mixed old/new tuple — the RxJS glitch — is exactly a violation of this invariant. |
| `consistent_init`                                                     | The constructors establish the invariant (initial values are computed from parent snapshots).                                                                                                                                                          |
| `consistent_run`                                                      | End to end: after any scenario of source updates, every `map`/`combine` node shows the value derived from the current source values. For the docs' diamond: `sum = 1010 × counter`, always.                                                            |
| `wave_log_shape`                                                      | One wave emits **at most once per observable**, and every emitted value equals the emitting node's settled post-wave value. (RxJS's `combineLatest` emits twice per diamond tick, once with a glitch value.)                                           |
| `emitted_combine_is_settled`                                          | Subscribers never observe a glitch: every `combine` emission is the tuple of the settled post-wave parent values.                                                                                                                                      |

`filter` and `zip` are deliberately outside the `Consistent` predicate: a
filter node holds its last _passing_ value (the documented "filter diamond"
behavior), and zip is queue-stateful — its contract is candidate 2.

### Candidate 2 — zip pairs emissions strictly by index

| Theorem (`SynstateFormal/Zip.lean`) | Statement                                                                                                                                                                                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zipWaveStep` + `wave_zip_bridge`   | One wave's effect on a two-parent zip is a pure function: enqueue the fired value, dequeue one pair iff both queues are non-empty. The bridge proves the imperative wave implements exactly this.                                                                          |
| `zipWaveStep_min`                   | The standing invariant: after every wave, at least one zip queue is empty (queues never build up on both sides).                                                                                                                                                           |
| `zip_pairs`                         | **For any interleaving of source updates**, the emissions of `zip([a, b])` (a, b distinct sources, inside an arbitrary well-formed graph) are exactly `List.zip` of the values fired at `a` and at `b` — the n-th output pairs the n-th `a`-value with the n-th `b`-value. |

All theorems depend only on Lean's standard axioms
(`propext`, `Classical.choice`, `Quot.sound`) — no `sorry` anywhere.

## Conformance with the vitest suite (`SynstateFormal/Examples.lean`)

Compile-time `#guard` checks replaying, verbatim:

- the diamond from `docs/…/how-synstate-solved-the-glitch.mdx`
  (expected `0, 1010, 2020, 3030, 4040`; RxJS's glitched
  `0, 10, 1010, 1020, …` must _not_ appear),
- `combine case 1` from `combine.test.mts` (10 rows, incl. the
  filter-diamond stale values),
- `zip case 1` from `zip.test.mts` (filtered even/×3 streams, exercising
  same-wave double enqueue),
- the `zip` / `combine` docstring examples.

If the model and the implementation ever diverge on these scenarios, the
build fails.

## Model ↔ implementation map

| Model (`SynstateFormal/Model.lean`)                                     | Implementation                                                                             |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Node.depth`, `Graph.WF.depthMono`                                      | `ObservableBaseClass.depth` = `1 + maxDepth(parents)` (child-observable-class.mts)         |
| `orderedInsert`, `propagationOrder`                                     | `addDescendant`'s `binarySearch` + `Arr.toInserted` (root-observable-class.mts:35-50)      |
| `wave` (clear flags → `setNext` root → fold `tryUpdate` in depth order) | `RootObservableClass.startUpdate` (root-observable-class.mts:52-60)                        |
| `NodeState.updated` flag, cleared per wave                              | `#mut_updateToken === updateToken` comparison (fresh token per `startUpdate`)              |
| `tryUpdate` per `Op`                                                    | map.mts:86-99, filter.mts:110-125, combine.mts:107-119, zip.mts:98-116                     |
| `initStep` / `State.init`                                               | constructor `initialValue` computations (map.mts:76-78, combine.mts:94-104, zip.mts:81-91) |
| `State.log`                                                             | `setNext` → subscriber `onNext` calls                                                      |

### Known modeling deltas (all behavior-preserving, documented in `Model.lean`)

- The implementation walks only the _descendants_ of the updating root; the
  model walks all child nodes in depth order. Non-descendants skip because
  no parent holds the current token (`combine.mts:108`'s "all parents are
  skipped" check), so the observable behavior is identical.
- `UpdateToken` equality is modeled as a per-wave boolean flag (a fresh
  token per wave makes the two equivalent).
- Waves are modeled for single-root updates started at `source` nodes; an
  `AsyncChildObservable` starting its own wave (debounce timer firing, etc.)
  acts as a source in this view. Async operator timing itself (candidate 4)
  is out of scope here.
- `take`/completion (`tryComplete` lifecycle) are not modeled (candidate 3).

## Layout

```txt
SynstateFormal/
  Model.lean       -- executable model of the propagation core
  Sorting.lean     -- sorted insertion / propagation-order properties
  Frame.lean       -- frame lemmas: tryUpdate touches only its own node
  GlitchFree.lean  -- candidate 1: consistency + emission discipline
  Zip.lean         -- candidate 2: zip pairs by index
  Examples.lean    -- #guard conformance with vitest / docs scenarios
```

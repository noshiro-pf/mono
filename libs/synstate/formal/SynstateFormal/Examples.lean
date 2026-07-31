/-
Conformance checks: the scenarios of the vitest suite and the docs, replayed
against the executable model. Every `#guard` is checked at compile time.

Sources of the expected outputs (they are the *unit tests' intent*):
  - packages/docs/src/content/docs/internals/how-synstate-solved-the-glitch.mdx
    (the diamond example; RxJS emits glitch values 10, 1020, 2030, ... here)
  - packages/synstate/test/cases/combine.test.mts (`combine case 1`)
  - packages/synstate/test/cases/zip.test.mts (`zip case 1`)
  - combine.mts / zip.mts docstring examples
-/
import SynstateFormal.Model

namespace Synstate.Examples

/-! ### Val helpers -/

private def vi (n : Int) : Val := .int n

private def mulI (m : Int) : Val → Val
  | .int k => .int (m * k)
  | v => v

private def sqI : Val → Val
  | .int k => .int (k * k)
  | v => v

private def evenI : Val → Bool
  | .int k => k % 2 == 0
  | _ => false

private def mult3I : Val → Bool
  | .int k => k % 3 == 0
  | _ => false

/-- `map(([a, b]) => a + b)` -/
private def sumPair : Val → Val
  | .tup [.int a, .int b] => .int (a + b)
  | v => v

private def noInit : NodeId → Option Val := fun _ => none

/-!
### 1. The diamond from "How SynState Solved the Glitch"

    counter ──→ ×10 ──────┐
       │                  ↓
       └────→ ×1000 ──→ combine ──→ sum

RxJS emits `0, 10, 1010, 1020, 2020, 2030, 3030` here (glitches!).
synstate must emit exactly the multiples of 1010.
-/

private def diamond : Graph :=
  ⟨[ ⟨.source, [], 0⟩,          -- 0: counter
     ⟨.map (mulI 10), [0], 1⟩,   -- 1: multipliedBy10
     ⟨.map (mulI 1000), [0], 1⟩, -- 2: multipliedBy1000
     ⟨.combine, [1, 2], 2⟩,      -- 3: combine([1, 2])
     ⟨.map sumPair, [3], 3⟩ ]⟩   -- 4: sum

private def diamondRun : State :=
  run diamond noInit ((List.range 5).map (fun k => (0, vi (Int.ofNat k))))

#guard emissions diamondRun 4
    == [vi 0, vi 1010, vi 2020, vi 3030, vi 4040]

-- Exactly one `sum` emission per wave — RxJS produces two from wave 1 on.
#guard (emissions diamondRun 4).length == 5

/-!
### 2. `combine case 1` (combine.test.mts)

    counter ─┬→ double ────────────────────┬─→ combine
             ├→ (×2) ──→ quad ─────────────┤
             ├→ square ─┬──────────────────┤
             │          └→ squareEven ─────┤
             └─────────────────────────────┘

`squareEven` is a `filter`, so it legitimately holds its last passing value
(the "filter diamond" documented behavior) — rows below are the unit test's
`expectedOutput` verbatim.
-/

private def combineCase1 : Graph :=
  ⟨[ ⟨.source, [], 0⟩,             -- 0: counter (take(10) modeled by 10 events)
     ⟨.map (mulI 2), [0], 1⟩,       -- 1: double
     ⟨.map (mulI 2), [0], 1⟩,       -- 2: intermediate of quad
     ⟨.map (mulI 2), [2], 2⟩,       -- 3: quad
     ⟨.map sqI, [0], 1⟩,            -- 4: square
     ⟨.filter evenI, [4], 2⟩,       -- 5: squareEven
     ⟨.combine, [0, 1, 3, 4, 5], 3⟩ ]⟩ -- 6: combined

private def combineCase1Run : State :=
  run combineCase1 noInit ((List.range 10).map (fun k => (0, vi (Int.ofNat k))))

private def row (l : List Int) : Val := .tup (l.map vi)

#guard emissions combineCase1Run 6 ==
  [ row [0, 0, 0, 0, 0],
    row [1, 2, 4, 1, 0],
    row [2, 4, 8, 4, 4],
    row [3, 6, 12, 9, 4],
    row [4, 8, 16, 16, 16],
    row [5, 10, 20, 25, 16],
    row [6, 12, 24, 36, 36],
    row [7, 14, 28, 49, 36],
    row [8, 16, 32, 64, 64],
    row [9, 18, 36, 81, 64] ]

/-!
### 3. `zip case 1` (zip.test.mts)

    counter ─┬→ filter (even) ──┬─→ zip
             └→ filter (n%3=0) ─┘

Exercises the same-wave double-enqueue path (k ≡ 0 mod 6) as well as
one-sided enqueues.
-/

private def zipCase1 : Graph :=
  ⟨[ ⟨.source, [], 0⟩,          -- 0: counter (take(23) modeled by 23 events)
     ⟨.filter evenI, [0], 1⟩,    -- 1: even
     ⟨.filter mult3I, [0], 1⟩,   -- 2: multiples of 3
     ⟨.zip, [1, 2], 2⟩ ]⟩        -- 3: zipped

private def zipCase1Run : State :=
  run zipCase1 noInit ((List.range 23).map (fun k => (0, vi (Int.ofNat k))))

#guard emissions zipCase1Run 3 ==
  [ row [0, 0], row [2, 3], row [4, 6], row [6, 9],
    row [8, 12], row [10, 15], row [12, 18], row [14, 21] ]

/-!
### 4. `zip` docstring example (zip.mts)

Two initialized sources (`createState('A')`, `createState(1)`).
The initial tuple comes from the constructor snapshot (not the queues);
subsequent pairs are index-aligned.
-/

private def zipDoc : Graph :=
  ⟨[ ⟨.source, [], 0⟩,   -- 0: letters ('A')
     ⟨.source, [], 0⟩,   -- 1: numbers (1)
     ⟨.zip, [0, 1], 1⟩ ]⟩ -- 2: zipped

private def zipDocInit : NodeId → Option Val
  | 0 => some (.str "A")
  | 1 => some (vi 1)
  | _ => none

private def zipDocRun : State :=
  run zipDoc zipDocInit [(0, .str "B"), (0, .str "C"), (1, vi 2), (1, vi 3)]

-- constructor initial value = tuple of parent snapshots (zip.mts:83-91)
#guard (State.init zipDoc zipDocInit).value 2 == some (.tup [.str "A", vi 1])

-- subscriber history = initial value + wave emissions = [A,1], [B,2], [C,3]
#guard emissions zipDocRun 2
    == [.tup [.str "B", vi 2], .tup [.str "C", vi 3]]

/-!
### 5. `combine` docstring example (combine.mts)

Uninitialized sources; `combine` stays silent until all parents have
emitted, then emits on every parent emission.
-/

private def combineDoc : Graph :=
  ⟨[ ⟨.source, [], 0⟩,       -- 0: name$
     ⟨.source, [], 0⟩,       -- 1: age$
     ⟨.combine, [0, 1], 1⟩ ]⟩ -- 2: user$

private def combineDocRun : State :=
  run combineDoc noInit
    [(0, .str "Alice"), (1, vi 25), (0, .str "Bob"), (1, vi 30)]

#guard emissions combineDocRun 2 ==
  [ .tup [.str "Alice", vi 25],
    .tup [.str "Bob", vi 25],
    .tup [.str "Bob", vi 30] ]

end Synstate.Examples

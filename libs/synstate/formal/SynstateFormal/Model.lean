/-
An executable model of synstate's synchronous propagation core.

This mirrors, as directly as possible:
  - `RootObservableClass.startUpdate`   (root-observable-class.mts:52-60)
  - `SyncChildObservableClass` depth     (child-observable-class.mts:216)
  - `MapObservableClass.tryUpdate`       (map.mts:86-99)
  - `CombineObservableClass.tryUpdate`   (combine.mts:107-119)
  - `ZipObservableClass.tryUpdate`       (zip.mts:98-116)

Modeling decisions (each noted where it matters):
  * An `UpdateToken` comparison `parent.updateToken === updateToken` is
    modeled as a per-node `updated : Bool` flag that is cleared at the start
    of every wave (a fresh token is issued per `startUpdate`, so "has the
    current token" is exactly "was set during the current wave").
  * The implementation walks only the *descendants* of the updating root
    (`#mut_propagationOrder`). The model walks *all* child nodes in depth
    order; for non-descendants every operator skips because no parent holds
    the current token, so this is behavior-preserving (`tryUpdate_skip`).
  * Node ids are creation-order indices. In the implementation parents are
    always constructed before children (you need the parent object to call
    `pipe` / `combine` / `zip`), hence `p < i` for every edge — this is the
    `parentsBefore` well-formedness field.
-/

namespace Synstate

/-- Values flowing through observables. `combine`/`zip` emit tuples. -/
inductive Val where
  | int : Int → Val
  | str : String → Val
  | tup : List Val → Val
deriving BEq, Repr

abbrev NodeId := Nat

/-- Operator kinds of the synchronous core. -/
inductive Op where
  /-- `source` / `RootObservableClass` (also `createState`). -/
  | source
  /-- `map(f)` — single parent. -/
  | map (f : Val → Val)
  /-- `filter(p)` — single parent; passes values satisfying `p` through and
  keeps its previous value otherwise. -/
  | filter (p : Val → Bool)
  /-- `combine(parents)` — emits the tuple of latest parent values. -/
  | combine
  /-- `zip(parents)` — pairs parent emissions by index via FIFO queues. -/
  | zip

structure Node where
  op      : Op
  parents : List NodeId
  /-- `depth` field of `ObservableBaseClass`; `1 + maxDepth(parents)` by
  default in the implementation. Well-formedness only requires strict
  monotonicity along edges (`depthMono`), which is what the default
  guarantees. -/
  depth   : Nat

structure Graph where
  nodes : List Node

namespace Graph

def node? (g : Graph) (i : NodeId) : Option Node := g.nodes[i]?

def size (g : Graph) : Nat := g.nodes.length

def depthOf (g : Graph) (i : NodeId) : Nat :=
  ((g.node? i).map Node.depth).getD 0

def isChild (g : Graph) (i : NodeId) : Bool :=
  match g.node? i with
  | some n => match n.op with | .source => false | _ => true
  | none => false

/-- Well-formedness invariants established by the constructors:
`registerChild` requires parents to exist first (`parentsBefore`), and
`depth = 1 + maxDepth(parents)` gives `depthMono`. Sources have no parents;
children have at least one. -/
structure WF (g : Graph) : Prop where
  parentsBefore : ∀ i n, g.node? i = some n → ∀ p ∈ n.parents, p < i
  depthMono     : ∀ i n, g.node? i = some n → ∀ p ∈ n.parents,
                    g.depthOf p < n.depth
  sourceNoParents : ∀ i n, g.node? i = some n →
                    (match n.op with | .source => n.parents = [] | _ => n.parents ≠ [])

end Graph

/-- Mutable per-observable state (`#mut_currentValue`, `#mut_updateToken`,
and `#queues` for zip). -/
structure NodeState where
  value   : Option Val
  /-- "this node's `updateToken` equals the current wave's token". -/
  updated : Bool
  /-- zip only: one FIFO queue per parent (`ZipObservableClass.#queues`). -/
  queues  : List (List Val)
deriving BEq, Repr

def NodeState.initial : NodeState := ⟨none, false, []⟩

/-- Global state: per-node states plus a log of every `setNext` call
(observable id, emitted value), oldest first. The log models what
subscribers observe (`ObservableBaseClass.setNext` runs `s.onNext`). -/
structure State where
  st  : NodeId → NodeState
  log : List (NodeId × Val)

/-- Pointwise function update. -/
def upd (f : NodeId → NodeState) (i : NodeId) (x : NodeState) : NodeId → NodeState :=
  fun j => if j = i then x else f j

@[simp] theorem upd_same (f : NodeId → NodeState) (i : NodeId) (x : NodeState) :
    upd f i x i = x := by simp [upd]

@[simp] theorem upd_ne (f : NodeId → NodeState) (i j : NodeId) (x : NodeState)
    (h : j ≠ i) : upd f i x j = f j := by simp [upd, h]

namespace State

def value (s : State) (i : NodeId) : Option Val := (s.st i).value

def updated (s : State) (i : NodeId) : Bool := (s.st i).updated

def queues (s : State) (i : NodeId) : List (List Val) := (s.st i).queues

/-- `ObservableBaseClass.setNext`: store the value, take the current wave's
token, notify subscribers (= append to the log). -/
def setNext (s : State) (i : NodeId) (v : Val) : State :=
  { st  := upd s.st i { s.st i with value := some v, updated := true },
    log := s.log ++ [(i, v)] }

def setQueues (s : State) (i : NodeId) (qs : List (List Val)) : State :=
  { s with st := upd s.st i { s.st i with queues := qs } }

/-- Latest values of a parent list; `some vs` iff every parent has a value
(`parentValues.every(Optional.isSome)` in combine.mts / zip.mts). -/
def parentValues (s : State) (ps : List NodeId) : Option (List Val) :=
  ps.mapM (fun p => s.value p)

end State

/-- zip's enqueue phase (zip.mts:101-107): the queues of node `i` after
appending the snapshot of every parent that updated in this wave. -/
def zipEnqueued (s : State) (i : NodeId) (ps : List NodeId) : List (List Val) :=
  (ps.zip (s.queues i)).map fun (p, q) =>
    if s.updated p then
      match s.value p with
      | some v => q ++ [v]
      | none => q
    else q

/-- One `tryUpdate` call on node `i` (dispatch on the operator kind). -/
def tryUpdate (g : Graph) (s : State) (i : NodeId) : State :=
  match g.node? i with
  | none => s
  | some n =>
    match n.op with
    | .source => s -- sources never appear in a propagation order
    | .map f =>
      -- map.mts:86-99 (single parent; skip if token mismatch or no value)
      match n.parents with
      | [p] =>
        if s.updated p then
          match s.value p with
          | some v => s.setNext i (f v)
          | none => s
        else s
      | _ => s
    | .filter pr =>
      -- filter.mts:110-125 (emit only when the predicate holds)
      match n.parents with
      | [p] =>
        if s.updated p then
          match s.value p with
          | some v => if pr v then s.setNext i v else s
          | none => s
        else s
      | _ => s
    | .combine =>
      -- combine.mts:107-119
      if n.parents.any (fun p => s.updated p) then
        match s.parentValues n.parents with
        | some vs => s.setNext i (.tup vs)
        | none => s
      else s
    | .zip =>
      -- zip.mts:98-116: enqueue snapshots of parents updated in this wave,
      -- then, if every queue is non-empty, dequeue one from each and emit.
      match (zipEnqueued s i n.parents).mapM List.head? with
      | some heads =>
        (s.setNext i (.tup heads)).setQueues i
          ((zipEnqueued s i n.parents).map List.tail)
      | none => s.setQueues i (zipEnqueued s i n.parents)

/-- Insertion into a depth-sorted list, as performed by
`addDescendant` (root-observable-class.mts:35-50): `binarySearch` on the
depths followed by `Arr.toInserted`. A binary search over a sorted array
and this linear insertion produce lists that are sorted the same way,
which is the only property the algorithm relies on. -/
def orderedInsert (key : NodeId → Nat) (x : NodeId) : List NodeId → List NodeId
  | [] => [x]
  | y :: ys => if key x ≤ key y then x :: y :: ys else y :: orderedInsert key x ys

/-- The `#mut_propagationOrder` of a root that has seen every child node:
all child ids, inserted one by one (in creation order, as `registerChild`
fires at construction time) into a depth-sorted list. -/
def propagationOrder (g : Graph) : List NodeId :=
  ((List.range g.size).filter (fun i => g.isChild i)).foldl
    (fun acc i => orderedInsert (g.depthOf) i acc) []

/-- Issuing a fresh `UpdateToken` invalidates every node's "has the current
token" status at once; with the boolean encoding this clears all flags. -/
def State.clearUpdated (s : State) : State :=
  { st := fun j => { s.st j with updated := false }, log := s.log }

/-- `RootObservableClass.startUpdate`: issue a fresh token (= clear all
`updated` flags), `setNext` on the root, then `tryUpdate` every node of the
propagation order. -/
def wave (g : Graph) (s : State) (root : NodeId) (v : Val) : State :=
  (propagationOrder g).foldl (tryUpdate g) (s.clearUpdated.setNext root v)

/-- Initial values, mirroring the constructors:
sources take their `initialValue` argument; `map` maps the parent snapshot
(map.mts:76-78); `combine`/`zip` take the tuple of parent snapshots if all
are present (combine.mts:94-104, zip.mts:81-91; zip's queues start empty).
Nodes are initialized in creation order, so parents are ready first. -/
def initStep (g : Graph) (srcInit : NodeId → Option Val)
    (f : NodeId → NodeState) (i : NodeId) : NodeId → NodeState :=
  match g.node? i with
  | none => f
  | some n =>
    match n.op with
    | .source => upd f i ⟨srcInit i, false, []⟩
    | .map fn =>
      match n.parents with
      | [p] => upd f i ⟨(f p).value.map fn, false, []⟩
      | _ => f
    | .filter pr =>
      -- filter.mts:94-103: parent snapshot if it satisfies the predicate
      match n.parents with
      | [p] => upd f i ⟨(f p).value.bind (fun v => if pr v then some v else none),
                        false, []⟩
      | _ => f
    | .combine =>
      upd f i ⟨(n.parents.mapM (fun p => (f p).value)).map .tup, false, []⟩
    | .zip =>
      upd f i ⟨(n.parents.mapM (fun p => (f p).value)).map .tup, false,
               n.parents.map (fun _ => [])⟩

/-- Node states after constructing the first `m` observables. -/
def initFold (g : Graph) (srcInit : NodeId → Option Val) (m : Nat) :
    NodeId → NodeState :=
  (List.range m).foldl (initStep g srcInit) (fun _ => .initial)

def State.init (g : Graph) (srcInit : NodeId → Option Val) : State :=
  { st := initFold g srcInit g.size, log := [] }

/-- Run a scenario: a list of `(root, value)` events, each triggering one
synchronous wave (`source.next(v)` calls `startUpdate`). -/
def run (g : Graph) (srcInit : NodeId → Option Val)
    (events : List (NodeId × Val)) : State :=
  events.foldl (fun s e => wave g s e.1 e.2) (.init g srcInit)

/-- Emissions of node `i` in a state's log (what a subscriber of `i` has
received via `onNext`, excluding the initial-snapshot emission performed
at `subscribe` time). -/
def emissions (s : State) (i : NodeId) : List Val :=
  (s.log.filter (fun e => e.1 == i)).map (·.2)

end Synstate

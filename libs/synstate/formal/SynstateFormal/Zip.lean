/-
Candidate-2 theorem: `zip` pairs parent emissions strictly by index.

`ZipObservableClass.tryUpdate` (zip.mts:98-116) enqueues the snapshot of
every parent that carries the current update token and dequeues one element
from every queue as soon as all queues are non-empty. The correctness claim
of the unit tests (zip.test.mts, the zip docstring) is:

    the n-th emission of `zip([a, b])` is the pair of the n-th emission of
    `a` and the n-th emission of `b` — for *any* interleaving of source
    updates.

`zip_pairs` proves exactly that, for a two-parent zip fed by two distinct
source nodes inside an arbitrary well-formed graph.

Structure:
  * `zipWaveStep` — what one wave does to a zip node, as a pure function
    (enqueue at most one value per side, dequeue a pair if possible).
  * `wave_zip_bridge` — the model's wave really performs `zipWaveStep`
    (the imperative-to-pure bridge, using the frame lemmas).
  * `run_zip_go` — the induction over the scenario, entirely in terms of
    `zipWaveStep`; the key invariant is that at least one queue is always
    empty after a wave, and that queued values are exactly the fired values
    not yet consumed by a pair.
-/
import SynstateFormal.Model
import SynstateFormal.Sorting
import SynstateFormal.Frame
import SynstateFormal.GlitchFree

namespace Synstate

open State

/-! ### The pure step -/

/-- Tuple constructor used by the model's zip (`.tup [x, y]`). -/
def pairTup (x y : Val) : Val := .tup [x, y]

/-- One wave's effect on a two-queue zip: enqueue the fired values (at most
one per side — a wave has a single root), then emit one pair if both queues
are non-empty. Returns `(qa', qb', emitted)`. -/
def zipWaveStep (qa qb : List Val) (fireA fireB : Option Val) :
    List Val × List Val × List Val :=
  match (match fireA with | some v => qa ++ [v] | none => qa),
        (match fireB with | some v => qb ++ [v] | none => qb) with
  | x :: xs, y :: ys => (xs, ys, [pairTup x y])
  | qa', qb' => (qa', qb', [])

/-- The value the wave `r := v` fires into parent `c` (if any). -/
def fireOf (c r : NodeId) (v : Val) : Option Val :=
  if c = r then some v else none

/-- Values fired at source `c` during a scenario. -/
def firings (evs : List (NodeId × Val)) (c : NodeId) : List Val :=
  (evs.filter (fun e => e.1 == c)).map (·.2)

@[simp] theorem firings_nil (c : NodeId) : firings [] c = [] := rfl

theorem firings_cons (e : NodeId × Val) (evs : List (NodeId × Val)) (c : NodeId) :
    firings (e :: evs) c
      = (if e.1 == c then [e.2] else []) ++ firings evs c := by
  simp only [firings, List.filter_cons]
  split <;> simp_all

/-! ### z-tagged log entries are only written by z itself -/

theorem foldl_zlog_notMem (g : Graph) (z : NodeId) :
    ∀ (l : List NodeId) (t : State), z ∉ l →
      ((l.foldl (tryUpdate g) t).log).filter (fun e => e.1 == z)
        = t.log.filter (fun e => e.1 == z)
  | [], _, _ => rfl
  | y :: ys, t, h => by
    have hy : z ≠ y := fun hzy => h (hzy ▸ List.mem_cons_self)
    have hys : z ∉ ys := fun hmem => h (List.mem_cons_of_mem y hmem)
    rw [List.foldl_cons, foldl_zlog_notMem g z ys _ hys]
    rcases tryUpdate_log_shape g t y with hstep | ⟨w, hstep, _⟩
    · rw [hstep]
    · rw [hstep, List.filter_append]
      have : (y == z) = false := by
        simp [Ne.symm hy]
      simp [this]

/-! ### The bridge: one wave = one `zipWaveStep` -/

section Bridge

variable {g : Graph} {z a b : NodeId} {n : Node}

/-- One wave, seen by a two-parent zip node whose parents are sources:
queues evolve by `zipWaveStep`, and the zip's log contribution is exactly
the emitted pair (if any). `hmin` is the standing invariant that at least
one queue is empty. -/
private theorem wave_zip_bridge (hwf : g.WF)
    (hn : g.node? z = some n) (hop : n.op = .zip) (hps : n.parents = [a, b])
    (ha : g.isChild a = false) (hb : g.isChild b = false) (hab : a ≠ b)
    (s : State) {r : NodeId} (hr : g.isChild r = false) (v : Val)
    {qa qb : List Val} (hq : (s.st z).queues = [qa, qb])
    (hmin : qa = [] ∨ qb = []) :
    ((wave g s r v).st z).queues
      = [(zipWaveStep qa qb (fireOf a r v) (fireOf b r v)).1,
         (zipWaveStep qa qb (fireOf a r v) (fireOf b r v)).2.1]
    ∧ (wave g s r v).log.filter (fun e => e.1 == z)
      = s.log.filter (fun e => e.1 == z)
        ++ ((zipWaveStep qa qb (fireOf a r v) (fireOf b r v)).2.2).map
            (fun w => (z, w)) := by
  have hchild : g.isChild z = true := by simp [Graph.isChild, hn, hop]
  have hsize : z < g.size := Graph.lt_size_of_node? hn
  have hzr : z ≠ r := by
    intro h
    rw [h, hr] at hchild
    exact Bool.noConfusion hchild
  have hmem : z ∈ propagationOrder g := mem_propagationOrder.mpr ⟨hsize, hchild⟩
  obtain ⟨pre, post, horder, hzpre, hzpost, hfinal, _⟩ :=
    foldl_split_at_member g (propagationOrder_sorted g)
      (propagationOrder_nodup g) hmem (waveStart s r v)
  -- sources never appear in the order, hence not in `pre`
  have hsrc_notin : ∀ c, g.isChild c = false → c ∉ pre := by
    intro c hc hmem'
    have hcm : c ∈ propagationOrder g := by
      rw [horder]
      exact List.mem_append.mpr (Or.inl hmem')
    have := (mem_propagationOrder.mp hcm).2
    rw [hc] at this
    exact Bool.noConfusion this
  have hapre : a ∉ pre := hsrc_notin a ha
  have hbpre : b ∉ pre := hsrc_notin b hb
  -- z's post-wave state is decided by its own tryUpdate; log flows through
  have hwave_st : (wave g s r v).st z
      = (tryUpdate g (pre.foldl (tryUpdate g) (waveStart s r v)) z).st z := by
    rw [wave_eq_foldl]
    exact hfinal
  have hwave_log : (wave g s r v).log.filter (fun e => e.1 == z)
      = ((tryUpdate g (pre.foldl (tryUpdate g) (waveStart s r v)) z).log).filter
          (fun e => e.1 == z) := by
    rw [wave_eq_foldl, horder, List.foldl_append, List.foldl_cons]
    exact foldl_zlog_notMem g z post _ hzpost
  -- facts about the mid-wave state at z's turn
  have hqz : ((pre.foldl (tryUpdate g) (waveStart s r v)).st z).queues
      = [qa, qb] := by
    rw [foldl_st_notMem g pre _ hzpre, waveStart, setNext_st_ne _ _ hzr]
    simpa using hq
  have hparent : ∀ c, c ∉ pre →
      (c = r →
        (((pre.foldl (tryUpdate g) (waveStart s r v)).st c).updated = true
        ∧ ((pre.foldl (tryUpdate g) (waveStart s r v)).st c).value = some v))
      ∧ (c ≠ r →
        ((pre.foldl (tryUpdate g) (waveStart s r v)).st c).updated = false) := by
    intro c hcpre
    rw [foldl_st_notMem g pre _ hcpre]
    constructor
    · intro hcr
      subst hcr
      simp [waveStart]
    · intro hcr
      rw [waveStart, setNext_st_ne _ _ hcr]
      simp
  have hprelog : ((pre.foldl (tryUpdate g) (waveStart s r v)).log).filter
      (fun e => e.1 == z) = s.log.filter (fun e => e.1 == z) := by
    rw [foldl_zlog_notMem g z pre _ hzpre]
    show ((s.clearUpdated.setNext r v).log).filter (fun e => e.1 == z) = _
    rw [setNext_log, clearUpdated_log, List.filter_append]
    have hne : (r == z) = false := by simp [Ne.symm hzr]
    simp [hne]
  have hred := tryUpdate_zip
    (g := g) (s := pre.foldl (tryUpdate g) (waveStart s r v)) hn hop
  rw [hps] at hred
  -- abstract the mid-wave state
  generalize hgen : pre.foldl (tryUpdate g) (waveStart s r v) = t
    at hred hqz hparent hwave_st hwave_log hprelog
  obtain ⟨haR, haNR⟩ := hparent a hapre
  obtain ⟨hbR, hbNR⟩ := hparent b hbpre
  -- leaves: (which queue is empty) × (which parent fires) × (queue shapes)
  rcases hmin with rfl | rfl
  · -- qa = []
    by_cases har : a = r
    · -- a fires into the empty left queue
      have hbr : b ≠ r := fun h => hab (har.trans h.symm)
      obtain ⟨hua, hva⟩ := haR har
      have hub := hbNR hbr
      cases hqbv : qb with
      | nil =>
        subst hqbv
        simp [zipEnqueued, hqz, hua, hub, hva,
          List.mapM_cons, List.mapM_nil] at hred
        refine ⟨?_, ?_⟩
        · rw [hwave_st, hred]
          simp [zipWaveStep, fireOf, har, hbr]
        · rw [hwave_log, hred]
          simp [hprelog, zipWaveStep, fireOf, har, hbr]
      | cons w qb' =>
        subst hqbv
        simp [zipEnqueued, hqz, hua, hub, hva,
          List.mapM_cons, List.mapM_nil] at hred
        refine ⟨?_, ?_⟩
        · rw [hwave_st, hred]
          simp [zipWaveStep, fireOf, har, hbr, pairTup]
        · rw [hwave_log, hred]
          simp [hprelog, zipWaveStep, fireOf, har, hbr, pairTup]
    · have hua := haNR har
      by_cases hbr : b = r
      · -- b fires into the right queue; left queue empty ⇒ no pair
        obtain ⟨hub, hvb⟩ := hbR hbr
        simp [zipEnqueued, hqz, hua, hub, hvb,
          List.mapM_cons, List.mapM_nil] at hred
        refine ⟨?_, ?_⟩
        · rw [hwave_st, hred]
          simp [zipWaveStep, fireOf, har, hbr]
        · rw [hwave_log, hred]
          simp [hprelog, zipWaveStep, fireOf, har, hbr]
      · -- no parent fires
        have hub := hbNR hbr
        simp [zipEnqueued, hqz, hua, hub,
          List.mapM_cons, List.mapM_nil] at hred
        refine ⟨?_, ?_⟩
        · rw [hwave_st, hred]
          simp [zipWaveStep, fireOf, har, hbr]
        · rw [hwave_log, hred]
          simp [hprelog, zipWaveStep, fireOf, har, hbr]
  · -- qb = []
    by_cases hbr : b = r
    · -- b fires into the empty right queue
      have har : a ≠ r := fun h => hab (h.trans hbr.symm)
      obtain ⟨hub, hvb⟩ := hbR hbr
      have hua := haNR har
      cases hqav : qa with
      | nil =>
        subst hqav
        simp [zipEnqueued, hqz, hua, hub, hvb,
          List.mapM_cons, List.mapM_nil] at hred
        refine ⟨?_, ?_⟩
        · rw [hwave_st, hred]
          simp [zipWaveStep, fireOf, har, hbr]
        · rw [hwave_log, hred]
          simp [hprelog, zipWaveStep, fireOf, har, hbr]
      | cons w qa' =>
        subst hqav
        simp [zipEnqueued, hqz, hua, hub, hvb,
          List.mapM_cons, List.mapM_nil] at hred
        refine ⟨?_, ?_⟩
        · rw [hwave_st, hred]
          simp [zipWaveStep, fireOf, har, hbr, pairTup]
        · rw [hwave_log, hred]
          simp [hprelog, zipWaveStep, fireOf, har, hbr, pairTup]
    · have hub := hbNR hbr
      by_cases har : a = r
      · -- a fires into the left queue; right queue empty ⇒ no pair
        obtain ⟨hua, hva⟩ := haR har
        cases hqav : qa with
        | nil =>
          subst hqav
          simp [zipEnqueued, hqz, hua, hub, hva,
            List.mapM_cons, List.mapM_nil] at hred
          refine ⟨?_, ?_⟩
          · rw [hwave_st, hred]
            simp [zipWaveStep, fireOf, har, hbr]
          · rw [hwave_log, hred]
            simp [hprelog, zipWaveStep, fireOf, har, hbr]
        | cons w qa' =>
          subst hqav
          simp [zipEnqueued, hqz, hua, hub, hva,
            List.mapM_cons, List.mapM_nil] at hred
          refine ⟨?_, ?_⟩
          · rw [hwave_st, hred]
            simp [zipWaveStep, fireOf, har, hbr]
          · rw [hwave_log, hred]
            simp [hprelog, zipWaveStep, fireOf, har, hbr]
      · -- no parent fires
        have hua := haNR har
        cases hqav : qa with
        | nil =>
          subst hqav
          simp [zipEnqueued, hqz, hua, hub,
            List.mapM_cons, List.mapM_nil] at hred
          refine ⟨?_, ?_⟩
          · rw [hwave_st, hred]
            simp [zipWaveStep, fireOf, har, hbr]
          · rw [hwave_log, hred]
            simp [hprelog, zipWaveStep, fireOf, har, hbr]
        | cons w qa' =>
          subst hqav
          simp [zipEnqueued, hqz, hua, hub,
            List.mapM_cons, List.mapM_nil] at hred
          refine ⟨?_, ?_⟩
          · rw [hwave_st, hred]
            simp [zipWaveStep, fireOf, har, hbr]
          · rw [hwave_log, hred]
            simp [hprelog, zipWaveStep, fireOf, har, hbr]

end Bridge

/-! ### Pure bookkeeping around `zipWaveStep` -/

/-- A wave fires into at most one of two distinct parents. -/
theorem fireOf_one_none {a b r : NodeId} (hab : a ≠ b) (v : Val) :
    fireOf a r v = none ∨ fireOf b r v = none := by
  by_cases har : a = r
  · right
    have : b ≠ r := fun h => hab (har.trans h.symm)
    simp [fireOf, this]
  · left
    simp [fireOf, har]

theorem fireOf_toList (c r : NodeId) (v : Val) :
    (fireOf c r v).toList = if r == c then [v] else [] := by
  by_cases h : c = r
  · subst h
    simp [fireOf]
  · simp [fireOf, h, Ne.symm h]

/-- The step preserves "at least one queue is empty". -/
theorem zipWaveStep_min {qa qb : List Val} (hmin : qa = [] ∨ qb = [])
    {fA fB : Option Val} (hone : fA = none ∨ fB = none) :
    (zipWaveStep qa qb fA fB).1 = [] ∨ (zipWaveStep qa qb fA fB).2.1 = [] := by
  rcases hmin with rfl | rfl
  · rcases hone with rfl | rfl
    · cases qb <;> cases fB <;> simp [zipWaveStep]
    · cases fA with
      | none => cases qb <;> simp [zipWaveStep]
      | some v => cases qb <;> simp [zipWaveStep]
  · rcases hone with rfl | rfl
    · cases qa <;> cases fB <;> simp [zipWaveStep]
    · cases fA with
      | none => cases qa <;> simp [zipWaveStep]
      | some v => cases qa <;> simp [zipWaveStep]

/-- Recombination: emitting now and zipping the rest equals zipping the
whole streams. This is the pure heart of the zip theorem. -/
theorem zipWaveStep_recombine {α : Type} (tag : α)
    (qa qb ra rb : List Val) (fA fB : Option Val)
    (hmin : qa = [] ∨ qb = []) (hone : fA = none ∨ fB = none) :
    ((zipWaveStep qa qb fA fB).2.2).map (fun w => (tag, w))
      ++ (List.zip ((zipWaveStep qa qb fA fB).1 ++ ra)
                   ((zipWaveStep qa qb fA fB).2.1 ++ rb)).map
           (fun pr => (tag, pairTup pr.1 pr.2))
    = (List.zip ((qa ++ fA.toList) ++ ra) ((qb ++ fB.toList) ++ rb)).map
        (fun pr => (tag, pairTup pr.1 pr.2)) := by
  rcases hmin with rfl | rfl
  · rcases hone with rfl | rfl
    · -- fA arbitrary?? no: fA = none case first pattern
      cases fB with
      | none => cases qb <;> simp [zipWaveStep]
      | some v =>
        cases qb <;> simp [zipWaveStep]
    · cases fA with
      | none => cases qb <;> simp [zipWaveStep]
      | some v =>
        cases qb with
        | nil => simp [zipWaveStep]
        | cons w qb' => simp [zipWaveStep]
  · rcases hone with rfl | rfl
    · cases fB with
      | none => cases qa <;> simp [zipWaveStep]
      | some v =>
        cases qa with
        | nil => simp [zipWaveStep]
        | cons w qa' => simp [zipWaveStep]
    · cases fA with
      | none => cases qa <;> simp [zipWaveStep]
      | some v => cases qa <;> simp [zipWaveStep]

/-! ### The scenario induction and the main theorem -/

section Run

variable {g : Graph} {z a b : NodeId} {n : Node}

/-- Fold a scenario: the zip's new emissions are the index-wise pairing of
(already queued ++ still to fire) on both sides. -/
private theorem run_zip_go (hwf : g.WF)
    (hn : g.node? z = some n) (hop : n.op = .zip) (hps : n.parents = [a, b])
    (ha : g.isChild a = false) (hb : g.isChild b = false) (hab : a ≠ b) :
    ∀ (evs : List (NodeId × Val)) (s : State) (qa qb : List Val),
      (∀ e ∈ evs, g.isChild e.1 = false) →
      (s.st z).queues = [qa, qb] → (qa = [] ∨ qb = []) →
      ((evs.foldl (fun s e => wave g s e.1 e.2) s).log.filter
          (fun e => e.1 == z))
        = s.log.filter (fun e => e.1 == z)
          ++ (List.zip (qa ++ firings evs a) (qb ++ firings evs b)).map
              (fun pr => (z, pairTup pr.1 pr.2))
  | [], s, qa, qb, _, hq, hmin => by
    rcases hmin with rfl | rfl <;> simp
  | e :: evs, s, qa, qb, hroots, hq, hmin => by
    have hone := fireOf_one_none (a := a) (b := b) (r := e.1) hab e.2
    obtain ⟨hqueues, hlog⟩ := wave_zip_bridge hwf hn hop hps ha hb hab s
      (hroots e List.mem_cons_self) e.2 hq hmin
    have hmin' := zipWaveStep_min hmin hone
    have ih := run_zip_go hwf hn hop hps ha hb hab evs
      (wave g s e.1 e.2)
      (zipWaveStep qa qb (fireOf a e.1 e.2) (fireOf b e.1 e.2)).1
      (zipWaveStep qa qb (fireOf a e.1 e.2) (fireOf b e.1 e.2)).2.1
      (fun x hx => hroots x (List.mem_cons_of_mem e hx))
      (by
        rw [hqueues])
      hmin'
    rw [List.foldl_cons, ih, hlog, List.append_assoc]
    congr 1
    rw [firings_cons, firings_cons,
      show (if e.1 == a then [e.2] else []) = (fireOf a e.1 e.2).toList from
        (fireOf_toList a e.1 e.2).symm,
      show (if e.1 == b then [e.2] else []) = (fireOf b e.1 e.2).toList from
        (fireOf_toList b e.1 e.2).symm,
      ← List.append_assoc qa, ← List.append_assoc qb]
    exact zipWaveStep_recombine z qa qb (firings evs a) (firings evs b)
      (fireOf a e.1 e.2) (fireOf b e.1 e.2) hmin hone

/-- **`zip` pairs emissions strictly by index** (candidate-2 theorem).
For a two-parent zip fed by two distinct sources inside any well-formed
graph, and *any* interleaving of source updates, the wave emissions of the
zip node are exactly `List.zip` of the two parents' fired values. -/
theorem zip_pairs (hwf : g.WF)
    (hn : g.node? z = some n) (hop : n.op = .zip) (hps : n.parents = [a, b])
    (ha : g.isChild a = false) (hb : g.isChild b = false) (hab : a ≠ b)
    (src : NodeId → Option Val) (evs : List (NodeId × Val))
    (hroots : ∀ e ∈ evs, g.isChild e.1 = false) :
    emissions (run g src evs) z
      = (List.zip (firings evs a) (firings evs b)).map
          (fun pr => pairTup pr.1 pr.2) := by
  have hsize : z < g.size := Graph.lt_size_of_node? hn
  have hq0 : ((State.init g src).st z).queues = [[], []] := by
    show (initFold g src g.size z).queues = [[], []]
    rw [initFold_stable g src (Nat.lt_succ_self z) hsize]
    rw [initFold_succ]
    simp only [initStep, hn, hop, hps]
    simp [upd]
  have h := run_zip_go hwf hn hop hps ha hb hab evs (State.init g src)
    [] [] hroots hq0 (Or.inl rfl)
  show ((run g src evs).log.filter (fun e => e.1 == z)).map (·.2) = _
  rw [show (run g src evs).log
      = (evs.foldl (fun s e => wave g s e.1 e.2) (State.init g src)).log from rfl,
    h]
  simp [State.init, List.map_map, Function.comp]

end Run

end Synstate

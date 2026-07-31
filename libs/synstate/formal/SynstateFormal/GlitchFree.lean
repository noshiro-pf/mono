/-
Candidate-1 theorems: glitch-freedom of the synchronous propagation core.

Main results (all for well-formed graphs, waves started at source nodes):

  * `consistent_wave` — after every wave, each `map`/`combine` node's value
    equals its operator applied to its parents' *current* values. In
    particular `combine` never holds a mixed old/new tuple: the diamond in
    the docs always shows `sum = 1010 × counter`, never RxJS's transient
    `10, 1020, 2030, …`.

The key structural argument (`foldl_split_at_member` + `WF.depthMono`) is
the model-level statement of *why* depth-ordered propagation works: when a
node's `tryUpdate` runs, every strictly shallower node — in particular every
parent — has already reached its final state for this wave.
-/
import SynstateFormal.Model
import SynstateFormal.Sorting
import SynstateFormal.Frame

namespace Synstate

open State

/-! ### `clearUpdated` projections -/

@[simp] theorem clearUpdated_st (s : State) (j : NodeId) :
    (s.clearUpdated).st j = { s.st j with updated := false } := rfl

@[simp] theorem clearUpdated_log (s : State) : (s.clearUpdated).log = s.log := rfl

/-! ### Splitting the propagation fold at a member -/

/-- When the fold processes member `i` of a depth-sorted, duplicate-free
order, (a) `i`'s final state is decided by its own `tryUpdate` call, and
(b) every strictly shallower node is already final at that moment. -/
theorem foldl_split_at_member (g : Graph) {order : List NodeId}
    (hsort : order.Pairwise (depthLE g.depthOf)) (hnodup : order.Nodup)
    {i : NodeId} (hmem : i ∈ order) (t : State) :
    ∃ pre post, order = pre ++ i :: post ∧ i ∉ pre ∧ i ∉ post ∧
      (order.foldl (tryUpdate g) t).st i
        = (tryUpdate g (pre.foldl (tryUpdate g) t) i).st i ∧
      ∀ p, g.depthOf p < g.depthOf i →
        (order.foldl (tryUpdate g) t).st p
          = (pre.foldl (tryUpdate g) t).st p := by
  obtain ⟨pre, post, rfl⟩ := List.append_of_mem hmem
  have hnodup' := hnodup
  rw [List.nodup_append] at hnodup'
  have hipost : i ∉ post := by
    have := List.nodup_cons.mp hnodup'.2.1
    exact this.1
  have hipre : i ∉ pre := by
    intro hmem'
    exact hnodup'.2.2 i hmem' i List.mem_cons_self rfl
  have hsort' : ∀ b ∈ post, g.depthOf i ≤ g.depthOf b := by
    have h₂ : (i :: post).Pairwise (depthLE g.depthOf) :=
      (List.pairwise_append.mp hsort).2.1
    exact fun b hb => (List.pairwise_cons.mp h₂).1 b hb
  refine ⟨pre, post, rfl, hipre, hipost, ?_, ?_⟩
  · rw [List.foldl_append, List.foldl_cons]
    exact foldl_st_notMem g post _ hipost
  · intro p hp
    rw [List.foldl_append, List.foldl_cons]
    have hpi : p ≠ i := fun h => absurd hp (h ▸ Nat.lt_irrefl _)
    have hppost : p ∉ post := fun hmem' =>
      absurd hp (Nat.not_lt.mpr (hsort' p hmem'))
    rw [foldl_st_notMem g post _ hppost, tryUpdate_st_ne g _ hpi]

/-! ### The wave's starting state -/

/-- State at the beginning of a wave (fresh token issued, root emitted). -/
def waveStart (s : State) (r : NodeId) (v : Val) : State :=
  s.clearUpdated.setNext r v

theorem wave_eq_foldl (g : Graph) (s : State) (r : NodeId) (v : Val) :
    wave g s r v = (propagationOrder g).foldl (tryUpdate g) (waveStart s r v) := rfl

theorem waveStart_updOk (s : State) (r : NodeId) (v : Val) :
    UpdOk (waveStart s r v) := by
  intro j hj
  by_cases hjr : j = r
  · subst hjr; simp [waveStart]
  · rw [waveStart, setNext_st_ne _ _ hjr] at hj
    simp at hj

theorem waveStart_value_ne (s : State) {r j : NodeId} (v : Val) (h : j ≠ r) :
    ((waveStart s r v).st j).value = (s.st j).value := by
  rw [waveStart, setNext_st_ne _ _ h]; rfl

/-- If a node's flag is down mid-wave, its value is still the pre-wave one
(and it is not the root). -/
theorem preFold_value_of_not_updated (g : Graph) {pre : List NodeId}
    {s : State} {r : NodeId} {v : Val} {p : NodeId}
    (h : ((pre.foldl (tryUpdate g) (waveStart s r v)).st p).updated = false) :
    ((pre.foldl (tryUpdate g) (waveStart s r v)).st p).value = (s.st p).value
    ∧ p ≠ r := by
  have hstable := foldl_not_updated_stable g pre (waveStart s r v) h
  have hpr : p ≠ r := by
    intro hpr
    have hup : ((waveStart s r v).st r).updated = true := by simp [waveStart]
    rw [hpr, hup] at hstable
    exact Bool.noConfusion hstable.2
  exact ⟨hstable.1.trans (waveStart_value_ne s v hpr), hpr⟩

/-- Values present before the wave are still present mid-wave. -/
theorem preFold_isSome_mono (g : Graph) (pre : List NodeId)
    (s : State) (r : NodeId) (v : Val) (p : NodeId)
    (h : ((s.st p).value).isSome) :
    (((pre.foldl (tryUpdate g) (waveStart s r v)).st p).value).isSome := by
  apply foldl_value_isSome_mono
  by_cases hpr : p = r
  · subst hpr; simp [waveStart]
  · rw [waveStart_value_ne s v hpr]; exact h

/-! ### `parentValues` -/

@[simp] theorem State.value_st (s : State) (i : NodeId) :
    s.value i = (s.st i).value := rfl

@[simp] theorem State.updated_st (s : State) (i : NodeId) :
    s.updated i = (s.st i).updated := rfl

@[simp] theorem State.queues_st (s : State) (i : NodeId) :
    s.queues i = (s.st i).queues := rfl

theorem parentValues_congr {s₁ s₂ : State} :
    ∀ {ps : List NodeId}, (∀ p ∈ ps, (s₁.st p).value = (s₂.st p).value) →
      s₁.parentValues ps = s₂.parentValues ps
  | [], _ => rfl
  | p :: ps, h => by
    simp only [State.parentValues, State.value_st, List.mapM_cons] at *
    rw [h p List.mem_cons_self,
      show ps.mapM (fun q => (s₁.st q).value) = ps.mapM (fun q => (s₂.st q).value) from
        parentValues_congr (fun q hq => h q (List.mem_cons_of_mem p hq))]

theorem parentValues_none_of_mem {s : State} {p : NodeId} :
    ∀ {ps : List NodeId}, p ∈ ps → (s.st p).value = none →
      s.parentValues ps = none
  | [], hmem, _ => absurd hmem (List.not_mem_nil)
  | q :: ps, hmem, h => by
    rcases List.mem_cons.mp hmem with rfl | hmem'
    · simp [State.parentValues, State.value_st, List.mapM_cons, h]
    · have hrec : ps.mapM (fun x => (s.st x).value) = none := by
        have := parentValues_none_of_mem hmem' h
        simpa [State.parentValues, State.value_st] using this
      cases hq : (s.st q).value with
      | none => simp [State.parentValues, State.value_st, List.mapM_cons, hq]
      | some w =>
        simp [State.parentValues, State.value_st, List.mapM_cons, hq, hrec]

theorem exists_none_of_parentValues_none {s : State} :
    ∀ {ps : List NodeId}, s.parentValues ps = none →
      ∃ p ∈ ps, (s.st p).value = none
  | [], h => by simp [State.parentValues] at h
  | q :: ps, h => by
    simp only [State.parentValues, State.value_st, List.mapM_cons] at h
    cases hq : (s.st q).value with
    | none => exact ⟨q, List.mem_cons_self, hq⟩
    | some v =>
      rw [hq] at h
      cases hps : ps.mapM (fun p => (s.st p).value) with
      | some vs => rw [hps] at h; simp at h
      | none =>
        obtain ⟨p, hmem, hnone⟩ := exists_none_of_parentValues_none
          (show s.parentValues ps = none by
            simpa [State.parentValues, State.value_st] using hps)
        exact ⟨p, List.mem_cons_of_mem q hmem, hnone⟩

/-! ### Reductions of `tryUpdate` per operator -/

section Reductions

variable {g : Graph} {s : State} {i : NodeId} {n : Node}

theorem tryUpdate_map {f : Val → Val} {p : NodeId}
    (hn : g.node? i = some n) (hop : n.op = .map f) (hps : n.parents = [p]) :
    tryUpdate g s i =
      (if s.updated p then
        match s.value p with
        | some v => s.setNext i (f v)
        | none => s
       else s) := by
  simp only [tryUpdate, hn, hop, hps]
  rfl

theorem tryUpdate_combine
    (hn : g.node? i = some n) (hop : n.op = .combine) :
    tryUpdate g s i =
      (if n.parents.any (fun p => s.updated p) then
        match s.parentValues n.parents with
        | some vs => s.setNext i (.tup vs)
        | none => s
       else s) := by
  simp only [tryUpdate, hn, hop]
  rfl

theorem tryUpdate_zip
    (hn : g.node? i = some n) (hop : n.op = .zip) :
    tryUpdate g s i =
      (match (zipEnqueued s i n.parents).mapM List.head? with
       | some heads =>
         (s.setNext i (.tup heads)).setQueues i
           ((zipEnqueued s i n.parents).map List.tail)
       | none => s.setQueues i (zipEnqueued s i n.parents)) := by
  simp only [tryUpdate, hn, hop]
  rfl

end Reductions

/-! ### The consistency invariant (glitch-freedom) -/

/-- Every `map`/`combine` node's stored value is its operator applied to its
parents' *current* values. A combine holding a mixed old/new tuple — the RxJS
glitch — is exactly a violation of this predicate. (`filter` and `zip` are
intentionally exempt: a filter holds the last *passing* value — the
documented "filter diamond" behavior — and zip is queue-stateful.) -/
def Consistent (g : Graph) (s : State) : Prop :=
  ∀ i n, g.node? i = some n →
    (∀ f p, n.op = .map f → n.parents = [p] →
      s.value i = (s.value p).map f)
    ∧ (n.op = .combine →
      s.value i = (s.parentValues n.parents).map Val.tup)

theorem Graph.lt_size_of_node? {g : Graph} {i : NodeId} {n : Node}
    (h : g.node? i = some n) : i < g.size :=
  (List.getElem?_eq_some_iff.mp h).1

/-! #### Clause lemmas

Both clauses of `consistent_wave` follow the same script, abstracted over
the mid-wave state `t` (the state at the moment node `i` is processed) and
the frame facts established by `foldl_split_at_member`. -/

section Clauses

variable {g : Graph} {s : State} {r : NodeId} {v : Val} {i : NodeId} {n : Node}

private theorem map_clause_at (t : State) {f : Val → Val} {p : NodeId}
    (hn : g.node? i = some n) (hop : n.op = .map f) (hps : n.parents = [p])
    (hcons : Consistent g s)
    (hUpd : UpdOk t)
    (hfinal : (wave g s r v).st i = (tryUpdate g t i).st i)
    (hpfrozen : (wave g s r v).st p = t.st p)
    (hival : (t.st i).value = (s.st i).value)
    (hstable : (t.st p).updated = false → (t.st p).value = (s.st p).value) :
    (wave g s r v).value i = ((wave g s r v).value p).map f := by
  have hred := tryUpdate_map (s := t) hn hop hps
  simp only [State.updated_st, State.value_st] at hred
  cases hup : (t.st p).updated with
  | true =>
    obtain ⟨vp, hvp⟩ := Option.isSome_iff_exists.mp (hUpd p hup)
    rw [hup, hvp] at hred
    simp only [if_true] at hred
    simp only [State.value_st, hfinal, hpfrozen, hred, setNext_st_same, hvp]
    rfl
  | false =>
    rw [hup] at hred
    simp only [Bool.false_eq_true, if_false] at hred
    simp only [State.value_st, hfinal, hpfrozen, hred, hival, hstable hup]
    exact (hcons i n hn).1 f p hop hps

private theorem combine_clause_at (t : State)
    (hn : g.node? i = some n) (hop : n.op = .combine)
    (hcons : Consistent g s)
    (hfinal : (wave g s r v).st i = (tryUpdate g t i).st i)
    (hpfrozen : ∀ p ∈ n.parents, (wave g s r v).st p = t.st p)
    (hival : (t.st i).value = (s.st i).value)
    (hstable : ∀ p ∈ n.parents, (t.st p).updated = false →
      (t.st p).value = (s.st p).value)
    (hsomeMono : ∀ p ∈ n.parents, ((s.st p).value).isSome →
      ((t.st p).value).isSome) :
    (wave g s r v).value i
      = ((wave g s r v).parentValues n.parents).map Val.tup := by
  have hred := tryUpdate_combine (s := t) hn hop
  have hpv_frozen : (wave g s r v).parentValues n.parents
      = t.parentValues n.parents :=
    parentValues_congr (fun p hp => by rw [hpfrozen p hp])
  cases hany : n.parents.any (fun p => t.updated p) with
  | true =>
    rw [hany] at hred
    simp only [if_true] at hred
    cases hpv : t.parentValues n.parents with
    | some vs =>
      rw [hpv] at hred
      simp only [State.value_st, hfinal, hred, setNext_st_same, hpv_frozen, hpv]
      rfl
    | none =>
      rw [hpv] at hred
      obtain ⟨p₀, hp₀mem, hp₀none⟩ := exists_none_of_parentValues_none hpv
      have hp₀pre : (s.st p₀).value = none := by
        cases h : (s.st p₀).value with
        | none => rfl
        | some w =>
          have hsome := hsomeMono p₀ hp₀mem (by rw [h]; rfl)
          rw [hp₀none] at hsome
          exact Bool.noConfusion hsome
      have hs_pv : s.parentValues n.parents = none :=
        parentValues_none_of_mem hp₀mem hp₀pre
      have hlhs := (hcons i n hn).2 hop
      rw [hs_pv] at hlhs
      simp only [State.value_st] at hlhs
      simp only [State.value_st, hfinal, hred, hival, hpv_frozen, hpv]
      simpa using hlhs
  | false =>
    rw [hany] at hred
    simp only [Bool.false_eq_true, if_false] at hred
    have hpv_pre : t.parentValues n.parents = s.parentValues n.parents :=
      parentValues_congr (fun p hp => by
        have hpupd : (t.st p).updated = false := by
          have := List.any_eq_false.mp hany p hp
          simpa using this
        exact hstable p hp hpupd)
    simp only [State.value_st, hfinal, hred, hival, hpv_frozen, hpv_pre]
    exact (hcons i n hn).2 hop

end Clauses

/-- **Glitch-freedom of a wave.** If the state is consistent before a wave
started at a source node, it is consistent after it: depth-ordered
propagation re-establishes every `map`/`combine` equation against the
settled post-wave parent values. -/
theorem consistent_wave {g : Graph} (hwf : g.WF) {s : State}
    (hcons : Consistent g s) {r : NodeId} (hr : g.isChild r = false)
    (v : Val) : Consistent g (wave g s r v) := by
  intro i n hn
  have hsize : i < g.size := Graph.lt_size_of_node? hn
  have hdepth_i : g.depthOf i = n.depth := by
    simp [Graph.depthOf, hn]
  -- shared facts, established once the node is known to be a child
  have main : g.isChild i = true →
      ∃ t : State,
        UpdOk t
        ∧ (wave g s r v).st i = (tryUpdate g t i).st i
        ∧ (∀ p ∈ n.parents, (wave g s r v).st p = t.st p)
        ∧ (t.st i).value = (s.st i).value
        ∧ (∀ p, (t.st p).updated = false → (t.st p).value = (s.st p).value)
        ∧ (∀ p, ((s.st p).value).isSome → ((t.st p).value).isSome) := by
    intro hchild
    have hir : i ≠ r := by
      intro h
      rw [h, hr] at hchild
      exact Bool.noConfusion hchild
    have hmem : i ∈ propagationOrder g := mem_propagationOrder.mpr ⟨hsize, hchild⟩
    obtain ⟨pre, post, horder, hipre, hipost, hfinal, hfrozen⟩ :=
      foldl_split_at_member g (propagationOrder_sorted g)
        (propagationOrder_nodup g) hmem (waveStart s r v)
    refine ⟨pre.foldl (tryUpdate g) (waveStart s r v),
      updOk_foldl g pre _ (waveStart_updOk s r v),
      hfinal, ?_, ?_, ?_, ?_⟩
    · intro p hp
      apply hfrozen
      rw [hdepth_i]
      exact hwf.depthMono i n hn p hp
    · rw [foldl_st_notMem g pre _ hipre, waveStart_value_ne s v hir]
    · intro p hp
      exact (preFold_value_of_not_updated g hp).1
    · intro p hp
      exact preFold_isSome_mono g pre s r v p hp
  constructor
  · intro f p hop hps
    have hchild : g.isChild i = true := by simp [Graph.isChild, hn, hop]
    obtain ⟨t, hUpd, hfinal, hpfrozen, hival, hstable, hsomeMono⟩ := main hchild
    exact map_clause_at t hn hop hps hcons hUpd hfinal
      (hpfrozen p (hps ▸ List.mem_cons_self)) hival (hstable p)
  · intro hop
    have hchild : g.isChild i = true := by simp [Graph.isChild, hn, hop]
    obtain ⟨t, hUpd, hfinal, hpfrozen, hival, hstable, hsomeMono⟩ := main hchild
    exact combine_clause_at t hn hop hcons hfinal hpfrozen hival
      (fun p hp => hstable p) (fun p hp => hsomeMono p)

/-! ### Consistency of the constructors (`State.init`) -/

theorem initStep_ne (g : Graph) (src : NodeId → Option Val)
    (f : NodeId → NodeState) {i j : NodeId} (h : j ≠ i) :
    initStep g src f i j = f j := by
  unfold initStep
  cases hn : g.node? i with
  | none => rfl
  | some n =>
    cases hop : n.op with
    | source =>
      simp only [hop] <;> first | rfl | simp [upd, h]
    | map fn =>
      cases hps : n.parents with
      | nil => simp only [hop, hps] <;> first | rfl | simp [upd, h]
      | cons p rest =>
        cases rest with
        | nil => simp only [hop, hps] <;> first | rfl | simp [upd, h]
        | cons q rest' => simp only [hop, hps] <;> first | rfl | simp [upd, h]
    | filter pr =>
      cases hps : n.parents with
      | nil => simp only [hop, hps] <;> first | rfl | simp [upd, h]
      | cons p rest =>
        cases rest with
        | nil => simp only [hop, hps] <;> first | rfl | simp [upd, h]
        | cons q rest' => simp only [hop, hps] <;> first | rfl | simp [upd, h]
    | combine =>
      simp only [hop] <;> first | rfl | simp [upd, h]
    | zip =>
      simp only [hop] <;> first | rfl | simp [upd, h]

theorem initFold_succ (g : Graph) (src : NodeId → Option Val) (m : Nat) :
    initFold g src (m + 1) = initStep g src (initFold g src m) m := by
  unfold initFold
  rw [List.range_succ, List.foldl_append, List.foldl_cons, List.foldl_nil]

theorem initFold_stable (g : Graph) (src : NodeId → Option Val) {j : Nat} :
    ∀ {m k : Nat}, j < m → m ≤ k → initFold g src k j = initFold g src m j := by
  intro m k hj hmk
  induction k with
  | zero =>
    cases Nat.le_zero.mp hmk
    rfl
  | succ k ih =>
    rcases Nat.eq_or_lt_of_le hmk with heq | hlt
    · rw [heq]
    · have hmk' : m ≤ k := Nat.lt_succ_iff.mp hlt
      have hjk : j ≠ k := Nat.ne_of_lt (Nat.lt_of_lt_of_le hj hmk')
      rw [initFold_succ, initStep_ne g src _ hjk, ih hmk']

private theorem mapM_option_congr {α β : Type} {f f' : α → Option β} :
    ∀ {l : List α}, (∀ a ∈ l, f a = f' a) → l.mapM f = l.mapM f'
  | [], _ => rfl
  | a :: l, h => by
    simp only [List.mapM_cons]
    rw [h a List.mem_cons_self,
      mapM_option_congr (fun b hb => h b (List.mem_cons_of_mem a hb))]

theorem initFold_consistent (g : Graph) (hwf : g.WF) (src : NodeId → Option Val) :
    ∀ (m : Nat) (i : NodeId) (n : Node), g.node? i = some n → i < m →
      (∀ f p, n.op = .map f → n.parents = [p] →
        (initFold g src m i).value = ((initFold g src m p).value).map f)
      ∧ (n.op = .combine →
        (initFold g src m i).value
          = (n.parents.mapM (fun p => (initFold g src m p).value)).map Val.tup)
  | 0 => by
    intro i n _ h
    exact absurd h (Nat.not_lt_zero i)
  | m + 1 => by
    intro i n hn him
    rcases Nat.lt_succ_iff_lt_or_eq.mp him with him' | rfl
    · -- i < m: the step for node m touches neither i nor i's parents
      have ih := initFold_consistent g hwf src m i n hn him'
      have hstep_i : initFold g src (m + 1) i = initFold g src m i := by
        rw [initFold_succ, initStep_ne g src _ (Nat.ne_of_lt him')]
      have hstep_p : ∀ p ∈ n.parents,
          initFold g src (m + 1) p = initFold g src m p := by
        intro p hp
        have hpi : p < i := hwf.parentsBefore i n hn p hp
        rw [initFold_succ,
          initStep_ne g src _ (Nat.ne_of_lt (Nat.lt_trans hpi him'))]
      constructor
      · intro f p hop hps
        rw [hstep_i, hstep_p p (hps ▸ List.mem_cons_self)]
        exact ih.1 f p hop hps
      · intro hop
        rw [hstep_i, mapM_option_congr (fun p hp => by rw [hstep_p p hp])]
        exact ih.2 hop
    · -- i = m: the constructor of node m establishes its own equation
      have hstep_p : ∀ p ∈ n.parents,
          initFold g src (i + 1) p = initFold g src i p := by
        intro p hp
        have hpi : p < i := hwf.parentsBefore i n hn p hp
        rw [initFold_succ, initStep_ne g src _ (Nat.ne_of_lt hpi)]
      constructor
      · intro f p hop hps
        rw [hstep_p p (hps ▸ List.mem_cons_self), initFold_succ]
        simp only [initStep, hn, hop, hps]
        simp [upd]
      · intro hop
        rw [mapM_option_congr (fun p hp => by rw [hstep_p p hp])]
        rw [initFold_succ]
        simp only [initStep, hn, hop]
        simp [upd]

/-- The constructors leave the graph consistent: `map`/`combine` compute
their initial value from the parent snapshots
(map.mts:76-78, combine.mts:94-104). -/
theorem consistent_init {g : Graph} (hwf : g.WF) (src : NodeId → Option Val) :
    Consistent g (State.init g src) := by
  intro i n hn
  have hsize : i < g.size := Graph.lt_size_of_node? hn
  have h := initFold_consistent g hwf src g.size i n hn hsize
  constructor
  · intro f p hop hps
    simpa [State.init, State.value_st] using h.1 f p hop hps
  · intro hop
    simpa [State.init, State.parentValues, State.value_st] using h.2 hop

/-- Consistency holds after any run: initial construction plus any sequence
of source updates. -/
theorem consistent_foldl_waves {g : Graph} (hwf : g.WF) :
    ∀ (evs : List (NodeId × Val)) {s : State}, Consistent g s →
      (∀ e ∈ evs, g.isChild e.1 = false) →
      Consistent g (evs.foldl (fun s e => wave g s e.1 e.2) s)
  | [], _, hcons, _ => hcons
  | e :: rest, s, hcons, h =>
    consistent_foldl_waves hwf rest
      (consistent_wave hwf hcons (h e List.mem_cons_self) e.2)
      (fun x hx => h x (List.mem_cons_of_mem e hx))

/-- **Glitch-freedom, end to end**: for a well-formed graph and any scenario
of source updates, every `map`/`combine` node always shows the value derived
from the *current* source values. -/
theorem consistent_run {g : Graph} (hwf : g.WF) (src : NodeId → Option Val)
    (evs : List (NodeId × Val)) (hroots : ∀ e ∈ evs, g.isChild e.1 = false) :
    Consistent g (run g src evs) :=
  consistent_foldl_waves hwf evs (consistent_init hwf src) hroots

/-! ### Emission discipline: at most one emission per node per wave, and
emitted values are the settled ones -/

theorem foldl_log_shape (g : Graph) :
    ∀ (l : List NodeId) (t : State), l.Nodup →
      ∃ extra, (l.foldl (tryUpdate g) t).log = t.log ++ extra
        ∧ (extra.map Prod.fst).Sublist l
        ∧ ∀ e ∈ extra, ((l.foldl (tryUpdate g) t).st e.1).value = some e.2
  | [], t, _ => ⟨[], by simp, by simp, by simp⟩
  | y :: ys, t, hnodup => by
    obtain ⟨hy_notin, hys⟩ := List.nodup_cons.mp hnodup
    obtain ⟨extra', hlog', hsub', hval'⟩ :=
      foldl_log_shape g ys (tryUpdate g t y) hys
    rw [List.foldl_cons] at *
    rcases tryUpdate_log_shape g t y with hstep | ⟨w, hstep, hwval⟩
    · exact ⟨extra', by rw [hlog', hstep], hsub'.cons y, hval'⟩
    · refine ⟨(y, w) :: extra', ?_, ?_, ?_⟩
      · rw [hlog', hstep, List.append_assoc]
        rfl
      · exact hsub'.cons_cons (y, w).1
      · intro e he
        rcases List.mem_cons.mp he with rfl | he'
        · rw [foldl_st_notMem g ys _ hy_notin]
          exact hwval
        · exact hval' e he'

/-- **One wave, at most one emission per observable** (and exactly one for
the updating source), each equal to the emitting node's settled value.
Contrast with RxJS, where the diamond makes `combineLatest` emit twice per
tick — once with a mixed tuple. -/
theorem wave_log_shape (g : Graph) (s : State) {r : NodeId} (v : Val)
    (hr : g.isChild r = false) :
    ∃ extra, (wave g s r v).log = s.log ++ (r, v) :: extra
      ∧ (((r, v) :: extra).map Prod.fst).Nodup
      ∧ ∀ e ∈ (r, v) :: extra, ((wave g s r v).st e.1).value = some e.2 := by
  have hnodup := propagationOrder_nodup g
  obtain ⟨extra, hlog, hsub, hval⟩ :=
    foldl_log_shape g (propagationOrder g) (waveStart s r v) hnodup
  have hrnot : r ∉ propagationOrder g := by
    intro hmem
    have := (mem_propagationOrder.mp hmem).2
    rw [hr] at this
    exact Bool.noConfusion this
  refine ⟨extra, ?_, ?_, ?_⟩
  · rw [wave_eq_foldl, hlog]
    simp [waveStart]
  · have hsub₂ : (r :: extra.map Prod.fst).Sublist (r :: propagationOrder g) :=
      hsub.cons_cons r
    exact hsub₂.nodup (List.nodup_cons.mpr ⟨hrnot, hnodup⟩)
  · intro e he
    rcases List.mem_cons.mp he with rfl | he'
    · rw [wave_eq_foldl, foldl_st_notMem g _ _ hrnot]
      simp [waveStart]
    · exact hval e he'

/-- **Subscribers never observe a glitch.** Every `combine` emission of a
wave is the tuple of the *settled post-wave* parent values — never a mixed
old/new tuple. -/
theorem emitted_combine_is_settled {g : Graph} (hwf : g.WF) {s : State}
    (hcons : Consistent g s) {r : NodeId} (hr : g.isChild r = false) (v : Val) :
    ∃ extra, (wave g s r v).log = s.log ++ (r, v) :: extra
      ∧ (((r, v) :: extra).map Prod.fst).Nodup
      ∧ ∀ e ∈ (r, v) :: extra, ∀ n, g.node? e.1 = some n → n.op = .combine →
          some e.2 = ((wave g s r v).parentValues n.parents).map Val.tup := by
  obtain ⟨extra, hlog, hnodup, hval⟩ := wave_log_shape g s v hr
  refine ⟨extra, hlog, hnodup, ?_⟩
  intro e he n hn hop
  have h₁ := hval e he
  have h₂ := ((consistent_wave hwf hcons hr v) e.1 n hn).2 hop
  simp only [State.value_st] at h₂
  rw [← h₂, h₁]

end Synstate

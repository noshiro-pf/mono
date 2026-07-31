/-
Frame lemmas: how `tryUpdate` touches the state.

The central facts, mirroring what the implementation guarantees by
construction (`tryUpdate` of a node only ever calls `this.setNext`):

  * `tryUpdate g s i` modifies only the state of node `i`
    (`tryUpdate_st_ne`), and appends at most one log entry, tagged `i`
    (`tryUpdate_log_shape`).
  * `updated` flags are only ever raised during a wave, never lowered
    (`updated_persists`), and a node whose flag is still down at the end
    kept its value (`not_updated_stable`).
  * values never disappear (`value_isSome_mono`), and an updated node has
    a value (`UpdOk`) — `setNext` stores one.
-/
import SynstateFormal.Model

namespace Synstate

/-! ### Projection lemmas for the two state primitives -/

namespace State

@[simp] theorem setNext_st_same (s : State) (i : NodeId) (v : Val) :
    (s.setNext i v).st i = { s.st i with value := some v, updated := true } := by
  simp [setNext]

@[simp] theorem setNext_st_ne (s : State) {i j : NodeId} (v : Val) (h : j ≠ i) :
    (s.setNext i v).st j = s.st j := by
  simp [setNext, h]

@[simp] theorem setNext_log (s : State) (i : NodeId) (v : Val) :
    (s.setNext i v).log = s.log ++ [(i, v)] := rfl

@[simp] theorem setQueues_st_same (s : State) (i : NodeId) (qs : List (List Val)) :
    (s.setQueues i qs).st i = { s.st i with queues := qs } := by
  simp [setQueues]

@[simp] theorem setQueues_st_ne (s : State) {i j : NodeId} (qs : List (List Val))
    (h : j ≠ i) : (s.setQueues i qs).st j = s.st j := by
  simp [setQueues, h]

@[simp] theorem setQueues_log (s : State) (i : NodeId) (qs : List (List Val)) :
    (s.setQueues i qs).log = s.log := rfl

@[simp] theorem setQueues_value (s : State) (i j : NodeId) (qs : List (List Val)) :
    ((s.setQueues i qs).st j).value = (s.st j).value := by
  by_cases h : j = i
  · subst h; simp
  · simp [h]

@[simp] theorem setQueues_updated (s : State) (i j : NodeId) (qs : List (List Val)) :
    ((s.setQueues i qs).st j).updated = (s.st j).updated := by
  by_cases h : j = i
  · subst h; simp
  · simp [h]

end State

/-! ### The shape of `tryUpdate` -/

/-- Every branch of `tryUpdate` is a no-op, a `setNext`, a `setQueues`, or a
`setNext` followed by a `setQueues` — always targeting node `i` itself.
(This is the model-level counterpart of "a `tryUpdate` override only calls
`this.setNext`".) -/
theorem tryUpdate_shape (g : Graph) (s : State) (i : NodeId) :
    tryUpdate g s i = s
    ∨ (∃ v, tryUpdate g s i = s.setNext i v)
    ∨ (∃ qs, tryUpdate g s i = s.setQueues i qs)
    ∨ (∃ v qs, tryUpdate g s i = (s.setNext i v).setQueues i qs) := by
  unfold tryUpdate
  repeat' split
  all_goals first
    | exact Or.inl rfl
    | exact Or.inr (Or.inl ⟨_, rfl⟩)
    | exact Or.inr (Or.inr (Or.inl ⟨_, rfl⟩))
    | exact Or.inr (Or.inr (Or.inr ⟨_, _, rfl⟩))

/-- `tryUpdate` of node `i` leaves every other node untouched. -/
theorem tryUpdate_st_ne (g : Graph) (s : State) {i j : NodeId} (h : j ≠ i) :
    (tryUpdate g s i).st j = s.st j := by
  rcases tryUpdate_shape g s i with heq | ⟨v, heq⟩ | ⟨qs, heq⟩ | ⟨v, qs, heq⟩ <;>
    simp [heq, h]

/-- A node not occurring in `l` is untouched by the whole propagation fold. -/
theorem foldl_st_notMem (g : Graph) {j : NodeId} :
    ∀ (l : List NodeId) (s : State), j ∉ l →
      ((l.foldl (tryUpdate g) s).st j) = s.st j
  | [], _, _ => rfl
  | y :: ys, s, h => by
    have hy : j ≠ y := fun hjy => h (hjy ▸ List.mem_cons_self)
    have hys : j ∉ ys := fun hmem => h (List.mem_cons_of_mem y hmem)
    rw [List.foldl_cons, foldl_st_notMem g ys _ hys, tryUpdate_st_ne g s hy]

/-! ### Monotonicity of `updated` and `value` -/

/-- `updated` flags are never lowered by `tryUpdate`. -/
theorem updated_persists (g : Graph) (s : State) (i j : NodeId)
    (h : (s.st j).updated = true) : ((tryUpdate g s i).st j).updated = true := by
  rcases tryUpdate_shape g s i with heq | ⟨v, heq⟩ | ⟨qs, heq⟩ | ⟨v, qs, heq⟩ <;>
    rw [heq]
  · exact h
  · by_cases hji : j = i
    · subst hji; simp
    · rw [State.setNext_st_ne s v hji]; exact h
  · rw [State.setQueues_updated]; exact h
  · rw [State.setQueues_updated]
    by_cases hji : j = i
    · subst hji; simp
    · rw [State.setNext_st_ne s v hji]; exact h

theorem foldl_updated_persists (g : Graph) {j : NodeId} :
    ∀ (l : List NodeId) (s : State), (s.st j).updated = true →
      ((l.foldl (tryUpdate g) s).st j).updated = true
  | [], _, h => h
  | y :: ys, s, h =>
    foldl_updated_persists g ys _ (updated_persists g s y j h)

/-- If a node's flag is still down after `tryUpdate`, its value did not
change (a raised flag is the witness of every `setNext`). -/
theorem not_updated_stable (g : Graph) (s : State) (i j : NodeId)
    (h : ((tryUpdate g s i).st j).updated = false) :
    ((tryUpdate g s i).st j).value = (s.st j).value ∧ (s.st j).updated = false := by
  rcases tryUpdate_shape g s i with heq | ⟨v, heq⟩ | ⟨qs, heq⟩ | ⟨v, qs, heq⟩ <;>
    rw [heq] at h ⊢
  · exact ⟨rfl, h⟩
  · by_cases hji : j = i
    · subst hji; simp at h
    · rw [State.setNext_st_ne s v hji] at h ⊢; exact ⟨rfl, h⟩
  · rw [State.setQueues_updated] at h
    rw [State.setQueues_value]
    exact ⟨rfl, h⟩
  · rw [State.setQueues_updated] at h
    rw [State.setQueues_value]
    by_cases hji : j = i
    · subst hji; simp at h
    · rw [State.setNext_st_ne s v hji] at h ⊢; exact ⟨rfl, h⟩

theorem foldl_not_updated_stable (g : Graph) {j : NodeId} :
    ∀ (l : List NodeId) (s : State),
      ((l.foldl (tryUpdate g) s).st j).updated = false →
      ((l.foldl (tryUpdate g) s).st j).value = (s.st j).value
      ∧ (s.st j).updated = false
  | [], _, h => ⟨rfl, h⟩
  | y :: ys, s, h => by
    rw [List.foldl_cons] at h ⊢
    have ih := foldl_not_updated_stable g ys (tryUpdate g s y) h
    have step := not_updated_stable g s y j ih.2
    exact ⟨ih.1.trans step.1, step.2⟩

/-- Values never disappear. -/
theorem value_isSome_mono (g : Graph) (s : State) (i j : NodeId)
    (h : ((s.st j).value).isSome) : (((tryUpdate g s i).st j).value).isSome := by
  rcases tryUpdate_shape g s i with heq | ⟨v, heq⟩ | ⟨qs, heq⟩ | ⟨v, qs, heq⟩ <;>
    rw [heq]
  · exact h
  · by_cases hji : j = i
    · subst hji; simp
    · rw [State.setNext_st_ne s v hji]; exact h
  · rw [State.setQueues_value]; exact h
  · rw [State.setQueues_value]
    by_cases hji : j = i
    · subst hji; simp
    · rw [State.setNext_st_ne s v hji]; exact h

theorem foldl_value_isSome_mono (g : Graph) {j : NodeId} :
    ∀ (l : List NodeId) (s : State), ((s.st j).value).isSome →
      (((l.foldl (tryUpdate g) s).st j).value).isSome
  | [], _, h => h
  | y :: ys, s, h =>
    foldl_value_isSome_mono g ys _ (value_isSome_mono g s y j h)

/-! ### `updated → value present` -/

/-- Every node whose `updated` flag is raised holds a value — `setNext`
raises the flag and stores a value in the same assignment. -/
def UpdOk (s : State) : Prop :=
  ∀ j, (s.st j).updated = true → ((s.st j).value).isSome

theorem updOk_tryUpdate (g : Graph) (s : State) (i : NodeId) (h : UpdOk s) :
    UpdOk (tryUpdate g s i) := by
  intro j hj
  rcases tryUpdate_shape g s i with heq | ⟨v, heq⟩ | ⟨qs, heq⟩ | ⟨v, qs, heq⟩ <;>
    rw [heq] at hj ⊢
  · exact h j hj
  · by_cases hji : j = i
    · subst hji; simp
    · rw [State.setNext_st_ne s v hji] at hj ⊢; exact h j hj
  · rw [State.setQueues_updated] at hj
    rw [State.setQueues_value]
    exact h j hj
  · rw [State.setQueues_updated] at hj
    rw [State.setQueues_value]
    by_cases hji : j = i
    · subst hji; simp
    · rw [State.setNext_st_ne s v hji] at hj ⊢; exact h j hj

theorem updOk_foldl (g : Graph) :
    ∀ (l : List NodeId) (s : State), UpdOk s → UpdOk (l.foldl (tryUpdate g) s)
  | [], _, h => h
  | y :: ys, s, h => updOk_foldl g ys _ (updOk_tryUpdate g s y h)

/-! ### Log shape -/

/-- `tryUpdate` of node `i` appends at most one log entry, tagged `i`;
and if it appends `(i, v)` then node `i`'s value is `v` afterwards. -/
theorem tryUpdate_log_shape (g : Graph) (s : State) (i : NodeId) :
    (tryUpdate g s i).log = s.log
    ∨ ∃ v, (tryUpdate g s i).log = s.log ++ [(i, v)]
        ∧ ((tryUpdate g s i).st i).value = some v := by
  rcases tryUpdate_shape g s i with heq | ⟨v, heq⟩ | ⟨qs, heq⟩ | ⟨v, qs, heq⟩ <;>
    rw [heq]
  · exact Or.inl rfl
  · exact Or.inr ⟨v, rfl, by simp⟩
  · exact Or.inl rfl
  · exact Or.inr ⟨v, rfl, by simp⟩

end Synstate

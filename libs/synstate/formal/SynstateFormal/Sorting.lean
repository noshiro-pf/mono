/-
Properties of the propagation order.

`addDescendant` (root-observable-class.mts:35-50) maintains
`#mut_propagationOrder` as a depth-sorted list by inserting each newly
registered descendant at the position found by `binarySearch`. The model's
`orderedInsert` performs the same sorted insertion; here we prove that

  * insertion preserves depth-sortedness         (`orderedInsert_pairwise`)
  * insertion adds exactly the new element       (`orderedInsert_perm`)

and consequently that `propagationOrder g`

  * is depth-sorted                              (`propagationOrder_sorted`)
  * contains every child node exactly once       (`mem_propagationOrder`,
                                                  `propagationOrder_nodup`)
  * contains only child nodes                    (`isChild_of_mem_propagationOrder`)
-/
import SynstateFormal.Model

namespace Synstate

/-- `a` comes no deeper than `b`. -/
def depthLE (key : NodeId → Nat) (a b : NodeId) : Prop := key a ≤ key b

theorem mem_orderedInsert {key : NodeId → Nat} {x z : NodeId} :
    ∀ {l : List NodeId}, z ∈ orderedInsert key x l ↔ z = x ∨ z ∈ l
  | [] => by simp [orderedInsert]
  | y :: ys => by
    simp only [orderedInsert]
    split
    · simp [or_comm, or_left_comm, List.mem_cons]
    · simp [List.mem_cons, mem_orderedInsert (l := ys), or_left_comm]

theorem orderedInsert_perm (key : NodeId → Nat) (x : NodeId) :
    ∀ (l : List NodeId), (orderedInsert key x l).Perm (x :: l)
  | [] => List.Perm.refl _
  | y :: ys => by
    simp only [orderedInsert]
    split
    · exact List.Perm.refl _
    · exact ((orderedInsert_perm key x ys).cons y).trans (List.Perm.swap x y ys)

theorem orderedInsert_pairwise {key : NodeId → Nat} {x : NodeId} :
    ∀ {l : List NodeId}, l.Pairwise (depthLE key) →
      (orderedInsert key x l).Pairwise (depthLE key)
  | [], _ => by simp [orderedInsert, List.pairwise_singleton]
  | y :: ys, h => by
    rcases List.pairwise_cons.mp h with ⟨hy, hys⟩
    simp only [orderedInsert]
    split
    · rename_i hxy
      exact List.pairwise_cons.mpr
        ⟨fun z hz => by
          rcases List.mem_cons.mp hz with rfl | hz
          · exact hxy
          · exact Nat.le_trans hxy (hy z hz),
         h⟩
    · rename_i hxy
      have hyx : key y ≤ key x := Nat.le_of_lt (Nat.lt_of_not_le hxy)
      exact List.pairwise_cons.mpr
        ⟨fun z hz => by
          rcases mem_orderedInsert.mp hz with rfl | hz
          · exact hyx
          · exact hy z hz,
         orderedInsert_pairwise hys⟩

private theorem foldl_orderedInsert_pairwise (key : NodeId → Nat) :
    ∀ (l acc : List NodeId), acc.Pairwise (depthLE key) →
      (l.foldl (fun acc i => orderedInsert key i acc) acc).Pairwise (depthLE key)
  | [], _, h => h
  | y :: ys, acc, h =>
    foldl_orderedInsert_pairwise key ys _ (orderedInsert_pairwise h)

private theorem foldl_orderedInsert_perm (key : NodeId → Nat) :
    ∀ (l acc : List NodeId),
      (l.foldl (fun acc i => orderedInsert key i acc) acc).Perm (l ++ acc)
  | [], _ => List.Perm.refl _
  | y :: ys, acc => by
    have ih := foldl_orderedInsert_perm key ys (orderedInsert key y acc)
    have h₁ : (ys ++ orderedInsert key y acc).Perm (ys ++ y :: acc) :=
      (orderedInsert_perm key y acc).append_left ys
    exact (ih.trans h₁).trans List.perm_middle

theorem propagationOrder_sorted (g : Graph) :
    (propagationOrder g).Pairwise (depthLE g.depthOf) :=
  foldl_orderedInsert_pairwise _ _ _ List.Pairwise.nil

theorem propagationOrder_perm (g : Graph) :
    (propagationOrder g).Perm ((List.range g.size).filter (fun i => g.isChild i)) := by
  simpa [propagationOrder] using foldl_orderedInsert_perm g.depthOf
    ((List.range g.size).filter (fun i => g.isChild i)) []

theorem mem_propagationOrder {g : Graph} {i : NodeId} :
    i ∈ propagationOrder g ↔ i < g.size ∧ g.isChild i := by
  rw [(propagationOrder_perm g).mem_iff]
  simp [List.mem_filter, List.mem_range]

theorem propagationOrder_nodup (g : Graph) : (propagationOrder g).Nodup :=
  (propagationOrder_perm g).nodup_iff.mpr (List.filter_sublist.nodup List.nodup_range)

theorem isChild_of_mem_propagationOrder {g : Graph} {i : NodeId}
    (h : i ∈ propagationOrder g) : g.isChild i :=
  (mem_propagationOrder.mp h).2

end Synstate

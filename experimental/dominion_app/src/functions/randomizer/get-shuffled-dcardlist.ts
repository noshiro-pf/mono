import * as I from 'immutable'
import { TDCardProperty } from '~/types/dcard-property'

export const getDcardsInSelectedExpansionsWithIndex = (
  dcardlist: I.List<TDCardProperty>,
  selectedExpansions: I.List<string>,
): I.List<{ index: number; dcardprop: TDCardProperty }> => {
  const selectedExpansionsSet = selectedExpansions.toSet()

  return dcardlist
    .map((v, i) => ({ index: i, dcardprop: v }))
    .filter((v) => v.dcardprop.randomizerCandidate)
    .filter(
      (v) =>
        !selectedExpansionsSet.intersect(v.dcardprop.expansionName).isEmpty(),
    )
}

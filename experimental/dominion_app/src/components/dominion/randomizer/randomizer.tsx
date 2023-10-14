import { memo, useMemo, useState } from 'react'
import { RN } from 'rnjs'
import { useRNValue } from 'rnjs-hooks'
import * as fbc from '~/firebase/firebase-combined-values'
import { myName$ } from '~/local-storage-api'
import { SelectedCards } from '~/types/selected-cards'
import { RandomizerView } from './randomizer-view'

export const Randomizer = memo(() => {
  /* events */

  const [tabIndex, setTabIndex] = useState(0)

  /* streams */

  const signedInToGroup$: RN<boolean> = useMemo(
    () =>
      fbc.currentRandomizerGroup$
        .map((g) => g !== undefined)
        .mapTo<boolean>(true), // TODO
    [],
  )

  const BlackMarketIsUsed$: RN<boolean> = useMemo(
    () =>
      fbc.currentRandomizerGroup$.map(
        (group) =>
          group !== undefined &&
          !group.selectedCardsHistory.isEmpty() &&
          !group.selectedCardsHistory
            .get(group.selectedIndexInHistory, SelectedCards())
            .BlackMarketPile.isEmpty(),
      ),
    [],
  )

  /* extract values */

  const BlackMarketIsUsed = useRNValue(BlackMarketIsUsed$)
  const signedIn = useRNValue(myName$.map((n) => !!n))
  const signedInToGroup = useRNValue(signedInToGroup$)

  return (
    <RandomizerView
      BlackMarketIsUsed={BlackMarketIsUsed}
      signedIn={signedIn}
      tabIndex={tabIndex}
      tabIndexOnChange={setTabIndex}
      signedInToGroup={signedInToGroup}
    />
  )
})

Randomizer.displayName = 'Randomizer'

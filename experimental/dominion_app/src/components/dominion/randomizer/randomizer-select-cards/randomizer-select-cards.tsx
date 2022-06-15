import * as I from 'immutable'
import { memo } from 'react'
import { merge, RN } from 'rnjs'
import {
  useEventAsStream,
  useRN,
  useRNValue,
  useStateAsStream,
} from 'rnjs-hooks'
import * as fb from '~/firebase/firebase-worker'
import { selectCards } from '~/functions/randomizer/select-cards'
import { TSelectedCards } from '~/types/selected-cards'
import { RandomizerSelectCardsView } from './randomizer-select-cards-view'

export const RandomizerSelectCards = memo(() => {
  const expansions = useRNValue(fb.expansions$)

  // prettier-ignore
  const [selectedExpansions$, setSelectedExpansions]
    = useStateAsStream(I.List<string>());

  const [randomizerClick$, randomizerOnClick] = useEventAsStream()
  const [resetOnClick$, resetOnClick] = useEventAsStream()

  const selectedCards$: RN<TSelectedCards | 'error' | ''> = useRN(
    merge(
      resetOnClick$.mapTo('' as ''),
      randomizerClick$
        .withLatest(selectedExpansions$)
        .withLatest(fb.dcardlist$)
        .map(([[_, selectedExpansions], dcardlist]) =>
          selectCards(selectedExpansions, dcardlist)
        )
    ).startWith('')
  )

  /* extract values */

  const expansionsSelected = useRNValue(selectedExpansions$)
  const selectedCards = useRNValue(selectedCards$)
  // const selectedCardsCheckbox = SelectedCardsCheckbox()

  return (
    <RandomizerSelectCardsView
      expansions={expansions}
      expansionsSelected={expansionsSelected}
      selectedCards={selectedCards}
      randomizerOnClick={randomizerOnClick}
      resetOnClick={resetOnClick}
      setSelectedExpansions={setSelectedExpansions}
    />
  )
})

RandomizerSelectCards.displayName = 'RandomizerSelectCards'

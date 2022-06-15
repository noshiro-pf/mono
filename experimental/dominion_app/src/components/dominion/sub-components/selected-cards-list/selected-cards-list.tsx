import * as I from 'immutable'
import { memo, useCallback, useState } from 'react'
import { useRNValue } from 'rnjs-hooks'
import * as fb from '~/firebase/firebase-worker'
import { TDCardProperty } from '~/types/dcard-property'
import { TSelectedCards, TSelectedCardsKeys } from '~/types/selected-cards'
import {
  SelectedCardsCheckbox,
  TSelectedCardsCheckbox,
} from '~/types/selected-cards-checkbox-values'
import { DCardPropertyDialog } from '../dcard-property-dialog/dcard-property-dialog'
import { SelectedCardsListView } from './selected-cards-list-view'

const selectedCardsCategories: I.List<{
  name: TSelectedCardsKeys
  title: string
}> = I.List([
  { name: 'KingdomCards10' as const, title: '王国カード' },
  { name: 'BaneCard' as const, title: '災いカード（魔女娘用）' },
  { name: 'EventCards' as const, title: 'EventCards' },
  { name: 'LandmarkCards' as const, title: 'LandmarkCards' },
  { name: 'Obelisk' as const, title: 'Obelisk 指定カード' },
  { name: 'BlackMarketPile' as const, title: '闇市場デッキ' },
])

export const SelectedCardsList = memo(
  ({
    selectedCards,
    selectedCardsCheckbox: selectedCardsCheckboxInput,
    selectedCardsCheckboxOnChange: selectedCardsCheckboxOnChangeInput,
  }: Readonly<{
    selectedCards: TSelectedCards
    selectedCardsCheckbox?: TSelectedCardsCheckbox
    selectedCardsCheckboxOnChange?: (v: {
      category: string
      index: number
      checked: boolean
    }) => void
  }>) => {
    /* from props */
    const showSelectedCardsCheckbox = selectedCardsCheckboxInput !== undefined
    const selectedCardsCheckbox =
      selectedCardsCheckboxInput || SelectedCardsCheckbox()
    const selectedCardsCheckboxOnChange =
      selectedCardsCheckboxOnChangeInput || (() => 0)

    const dcardlist: I.List<TDCardProperty> = useRNValue(fb.dcardlist$)

    const [selectedCardIndex, setSelectedCardIndex] = useState(-1)

    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const closeDialog = useCallback(() => {
      setDialogIsOpen(false)
    }, [setDialogIsOpen])

    const cardInfoButtonClicked = useCallback(
      (cardIndex: number) => {
        setDialogIsOpen(true)
        setSelectedCardIndex(cardIndex)
      },
      [setDialogIsOpen, setSelectedCardIndex]
    )

    return (
      <>
        <SelectedCardsListView
          selectedCards={selectedCards}
          showSelectedCardsCheckbox={showSelectedCardsCheckbox}
          selectedCardsCheckboxOnChange={selectedCardsCheckboxOnChange}
          dcardlist={dcardlist}
          selectedCardsCheckbox={selectedCardsCheckbox}
          selectedCardsCategories={selectedCardsCategories}
          cardInfoButtonClicked={cardInfoButtonClicked}
        />
        <DCardPropertyDialog
          open={dialogIsOpen}
          closeDialog={closeDialog}
          dcardIndex={selectedCardIndex}
        />
      </>
    )
  }
)

SelectedCardsList.displayName = 'SelectedCardsList'

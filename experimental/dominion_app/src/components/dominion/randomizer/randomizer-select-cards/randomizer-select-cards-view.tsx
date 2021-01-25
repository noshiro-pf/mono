import { Button, Paper } from '@material-ui/core'
import * as I from 'immutable'
import React, { memo } from 'react'
import styled from 'styled-components'
import { TSelectedCards } from '~/types/selected-cards'
import { ExpansionsToggleList } from '../../sub-components/expansions-toggle-list/expansions-toggle-list'
import { ProsperityDarkAgesFlag } from '../../sub-components/prosperity-darkages-flag/prosperity-darkages-flag'
import { SelectedCardsList } from '../../sub-components/selected-cards-list/selected-cards-list'

const Root = styled.div`
  padding: 10px;
`

const ButtonsWrapper = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: row;
`

const ButtonItemWrapper = styled.div`
  padding: 5px;
`

export const RandomizerSelectCardsView = memo(
  ({
    expansions,
    expansionsSelected,
    selectedCards,
    randomizerOnClick,
    resetOnClick,
    setSelectedExpansions,
  }: Readonly<{
    expansions: I.List<string>
    expansionsSelected: I.List<string>
    selectedCards: TSelectedCards | 'error' | ''
    randomizerOnClick: () => void
    resetOnClick: () => void
    setSelectedExpansions: (v: I.List<string>) => void
  }>) => (
    <Root>
      {!expansions.isEmpty() && (
        <Paper style={{ padding: '10px' }}>
          <ExpansionsToggleList
            expansions={expansions}
            expansionsChecked={expansionsSelected}
            expansionscheckedOnChange={setSelectedExpansions}
          />
        </Paper>
      )}
      <ButtonsWrapper>
        <ButtonItemWrapper>
          <Button
            variant='contained'
            color='primary'
            onClick={randomizerOnClick}
          >
            カードを選択
          </Button>
        </ButtonItemWrapper>
        <ButtonItemWrapper>
          <Button variant='contained' color='default' onClick={resetOnClick}>
            リセット
          </Button>
        </ButtonItemWrapper>
      </ButtonsWrapper>
      {selectedCards === 'error' && (
        <div>サプライが足りません．セットの選択数を増やしてください．</div>
      )}
      {selectedCards !== '' && selectedCards !== 'error' && (
        <Paper style={{ padding: '10px' }}>
          <ProsperityDarkAgesFlag
            Prosperity={selectedCards.Prosperity}
            DarkAges={selectedCards.DarkAges}
          />
          <SelectedCardsList
            selectedCards={selectedCards}
            // selectedCardsCheckbox={selectedCardsCheckbox}
            // selectedCardsCheckboxOnChange={selectedCardsCheckboxOnChange}
          />
        </Paper>
      )}
    </Root>
  )
)

RandomizerSelectCardsView.displayName = 'RandomizerSelectCardsView'

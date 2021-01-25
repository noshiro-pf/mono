import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core'
import EditIcon from '@material-ui/icons/Edit'
import * as I from 'immutable'
import React, { CSSProperties, memo } from 'react'
import styled from 'styled-components'
import { TDCardProperty } from '~/types/dcard-property'
import { TPlayerResultChange } from '~/types/player-result-change'
import { TPlayerResultRanked } from '~/types/player-result-ranked'
import { TSelectedCardsId } from '~/types/selected-cards-id'
import { GamePlayedDate } from '../game-result-sub-components/game-played-date'
import { GameResultMemo } from '../game-result-sub-components/game-result-memo'
import { GameResultPlace } from '../game-result-sub-components/game-result-place'
import { PlayerResultTable } from '../game-result-sub-components/player-result-table/player-result-table'
import { SelectedExpansions } from '../game-result-sub-components/selected-expansions'
import { ProsperityDarkAgesFlag } from '../prosperity-darkages-flag/prosperity-darkages-flag'
import { SelectedCardsImageList } from '../selected-cards-image-list/selected-cards-image-list'

const dialogContentStyle: CSSProperties = {
  backgroundColor: 'light-gray',
}

const buttonStyle: CSSProperties = {
  margin: '5px',
  flexBasis: 'fit-content',
}

const Item = styled.div`
  margin: 10px;
`

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-x: auto;
`

export const GameResultDialogView = memo(
  ({
    isOpen,
    expansions,
    cardIdToDCardProperty,
    editMode,
    beginEditMode,
    submitChanges,
    discardChanges,
    submitChangesAndClose,
    discardChangesAndClose,

    place,
    placeList,
    placeChange,
    selectedExpansions,
    selectedCardsId,

    date,
    dateChange,
    memo,
    memoChange,
    lastTurnPlayer,
    lastTurnPlayerChange,
    playerResults,
    playerResultChange,
  }: Readonly<{
    isOpen: boolean
    expansions: I.List<string>
    cardIdToDCardProperty: I.Map<string, TDCardProperty>
    editMode: boolean
    beginEditMode: () => void
    submitChanges: () => void
    discardChanges: () => void
    submitChangesAndClose: () => void
    discardChangesAndClose: () => void

    place: string
    placeList: I.List<string>
    placeChange: (value: string) => void
    selectedExpansions: I.List<string>
    selectedCardsId: TSelectedCardsId
    date: string
    dateChange: (value: string) => void
    memo: string
    memoChange: (value: string) => void
    lastTurnPlayer: string
    lastTurnPlayerChange: (value: string) => void
    playerResults: I.List<TPlayerResultRanked>
    playerResultChange: (chg: TPlayerResultChange) => void
  }>) => (
    <Dialog open={isOpen} onClose={discardChangesAndClose}>
      <DialogContent style={dialogContentStyle}>
        <Item>
          <GamePlayedDate
            editMode={editMode}
            date={date}
            dateChange={dateChange}
          />
        </Item>
        <Item>
          <GameResultPlace
            editMode={editMode}
            place={place}
            placeList={placeList}
            placeChange={placeChange}
          />
        </Item>
        <Item>
          <PlayerResultTable
            editMode={editMode}
            lastTurnPlayer={lastTurnPlayer}
            playerResults={playerResults}
            lastTurnPlayerChange={lastTurnPlayerChange}
            playerResultChange={playerResultChange}
          />
        </Item>
        <Item>
          <GameResultMemo
            editMode={editMode}
            memo={memo}
            memoChange={memoChange}
          />
        </Item>
        <Item>
          <SelectedExpansions
            expansions={expansions}
            selectedExpansions={selectedExpansions}
          />
        </Item>
        <Item>
          <ProsperityDarkAgesFlag
            Prosperity={selectedCardsId.Prosperity}
            DarkAges={selectedCardsId.DarkAges}
          />
          <SelectedCardsImageList
            cardIdToDCardProperty={cardIdToDCardProperty}
            selectedCardsId={selectedCardsId}
          />
        </Item>
      </DialogContent>
      <DialogActions>
        <ButtonsWrapper>
          {!editMode ? (
            <>
              <Button style={buttonStyle} onClick={beginEditMode}>
                編集
                <EditIcon />
              </Button>
              <Button
                style={buttonStyle}
                color='primary'
                variant='outlined'
                onClick={discardChangesAndClose}
              >
                OK
              </Button>
            </>
          ) : (
            <>
              <Button
                style={buttonStyle}
                color='primary'
                onClick={submitChanges}
              >
                更新
              </Button>
              <Button
                style={buttonStyle}
                color='primary'
                variant='outlined'
                onClick={submitChangesAndClose}
              >
                更新して閉じる
              </Button>
              <Button
                style={buttonStyle}
                color='secondary'
                onClick={discardChanges}
              >
                編集内容を破棄
              </Button>
              <Button
                style={buttonStyle}
                color='secondary'
                variant='outlined'
                onClick={discardChangesAndClose}
              >
                編集内容を破棄して閉じる
              </Button>
            </>
          )}
        </ButtonsWrapper>
      </DialogActions>
    </Dialog>
  )
)

GameResultDialogView.displayName = 'GameResultDialogView'

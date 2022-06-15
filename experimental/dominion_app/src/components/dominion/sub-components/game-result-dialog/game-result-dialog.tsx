import * as I from 'immutable'
import { memo, useCallback, useMemo, useState } from 'react'
import { combine, merge, RN } from 'rnjs'
import {
  useEffectFromProps,
  useRN,
  useRNValue,
  useStateAsStream,
} from 'rnjs-hooks'
import { placeListFromGameResults$ } from '~/firebase/firebase-combined-values'
import * as fb from '~/firebase/firebase-worker'
import { TDCardProperty } from '~/types/dcard-property'
import { GameResult, getScored, TGameResult } from '~/types/game-result'
import {
  PlayerResultChange,
  TPlayerResultChange,
} from '~/types/player-result-change'
import {
  PlayerResultRanked,
  TPlayerResultRanked,
} from '~/types/player-result-ranked'
import { GameResultDialogView } from './game-result-dialog-view'

export const GameResultDialog = memo(
  ({
    isOpen,
    closeDialog,
    gameResult,
    expansions,
    cardIdToDCardProperty,
  }: Readonly<{
    isOpen: boolean
    closeDialog: () => void
    gameResult: TGameResult
    expansions: I.List<string>
    cardIdToDCardProperty: I.Map<string, TDCardProperty>
  }>) => {
    /* from props */

    const {
      key,
      place: placePrev,
      selectedExpansions,
      selectedCardsId,
      date: datePrev,
      memo: memoPrev,
      players: playerResultsPrev,
      lastTurnPlayer: lastTurnPlayerPrev,
    } = gameResult

    const playerResultsInit = useMemo(
      () => I.List(playerResultsPrev.map(PlayerResultRanked)),
      [playerResultsPrev]
    )

    const [date, setDate] = useState(datePrev)
    useEffectFromProps(datePrev, setDate)
    const [place, setPlace] = useState(placePrev)
    useEffectFromProps(placePrev, setPlace)
    const [memo, setMemo] = useState(memoPrev)
    useEffectFromProps(memoPrev, setMemo)

    // prettier-ignore
    const [lastTurnPlayer$, setLastTurnPlayer] = useStateAsStream(lastTurnPlayerPrev)
    useEffectFromProps(lastTurnPlayerPrev, setLastTurnPlayer)

    // prettier-ignore
    const [playerResultsInit$, setPlayerResultsInit] = useStateAsStream(playerResultsInit)
    useEffectFromProps(playerResultsInit, setPlayerResultsInit)

    // events

    const [editMode, setEditMode] = useState<boolean>(false)
    // prettier-ignore
    const beginEditMode = useCallback(() => { setEditMode(true)  }, [setEditMode])
    // prettier-ignore
    const endEditMode   = useCallback(() => { setEditMode(false) }, [setEditMode])

    // prettier-ignore
    const [playerResultChange$, playerResultChange]
      = useStateAsStream<TPlayerResultChange>(PlayerResultChange())

    /* streams */

    const playerResults$: RN<I.List<TPlayerResultRanked>> = useRN(
      merge(
        playerResultsInit$,
        combine(
          fb.scoreTable$,
          lastTurnPlayer$,
          playerResultsInit$.switchMap((init) =>
            playerResultChange$.scan(init, (state, chg) => {
              const k = chg.key
              const playerIndex = chg.playerIndex
              const value = chg.value
              console.log(chg.toJS(), state.toJS())
              // TODO: なぜかplayerResultChangeの発火1回につき6回も発火してしまう
              if (k !== 'turnOrder') {
                return state.setIn([playerIndex, k], value)
              } else {
                if (value !== -1 && value !== 1) {
                  throw new Error(
                    'ERROR: turnOrder button should emits -1 or +1.'
                  )
                }
                const curr = state.getIn([playerIndex, 'turnOrder'])
                const swapIndex =
                  state.findIndex((e) => e.turnOrder === curr + value) || 0
                return state
                  .updateIn([playerIndex, 'turnOrder'], (x) => x + value)
                  .updateIn([swapIndex, 'turnOrder'], (x) => x - value)
              }
            })
          )
        ).map(([scoreTbl, lastTurnPl, playerResult]) =>
          getScored(scoreTbl, playerResult, lastTurnPl)
        )
      )
    )

    /* extract values */

    const playerResults = useRNValue(playerResults$)
    const lastTurnPlayer = useRNValue(lastTurnPlayer$)
    const placeList = useRNValue(placeListFromGameResults$)

    /* actions */

    const discardChanges = useCallback(() => {
      endEditMode()
      setDate(datePrev)
      setMemo(memoPrev)
      setLastTurnPlayer(lastTurnPlayerPrev)
      setPlayerResultsInit(playerResultsInit)
    }, [
      endEditMode,
      setDate,
      setMemo,
      setLastTurnPlayer,
      setPlayerResultsInit,
      datePrev,
      memoPrev,
      lastTurnPlayerPrev,
      playerResultsInit,
    ])

    const submitChanges = useCallback(async () => {
      endEditMode()
      await fb.setGameResult(
        key,
        GameResult({
          key,
          players: playerResults,
          date,
          memo,
          lastTurnPlayer,
          selectedCardsId,
          place,
          selectedExpansions,
        })
      )
      // TODO snackbar
    }, [
      endEditMode,
      key,
      playerResults,
      date,
      memo,
      lastTurnPlayer,
      selectedCardsId,
      place,
      selectedExpansions,
    ])

    const discardChangesAndClose = useCallback(() => {
      discardChanges()
      closeDialog()
    }, [discardChanges, closeDialog])

    const submitChangesAndClose = useCallback(() => {
      submitChanges()
      closeDialog()
    }, [submitChanges, closeDialog])

    return (
      <GameResultDialogView
        isOpen={isOpen}
        editMode={editMode}
        expansions={expansions}
        cardIdToDCardProperty={cardIdToDCardProperty}
        beginEditMode={beginEditMode}
        submitChanges={submitChanges}
        discardChanges={discardChanges}
        submitChangesAndClose={submitChangesAndClose}
        discardChangesAndClose={discardChangesAndClose}
        place={place}
        placeList={placeList}
        placeChange={setPlace}
        selectedExpansions={selectedExpansions}
        selectedCardsId={selectedCardsId}
        date={date}
        dateChange={setDate}
        memo={memo}
        memoChange={setMemo}
        lastTurnPlayer={lastTurnPlayer}
        lastTurnPlayerChange={setLastTurnPlayer}
        playerResults={playerResults}
        playerResultChange={playerResultChange}
      />
    )
  }
)

GameResultDialog.displayName = 'GameResultDialog'

import { CircularProgress } from '@material-ui/core'
import * as I from 'immutable'
import { memo } from 'react'
import { combine, merge, RN } from 'rnjs'
import {
  useEventAsStream,
  useRN,
  useRNValue,
  useStateAsStream,
} from 'rnjs-hooks'
import styled from 'styled-components'
import * as date from 'typescript-utils/functions/date'
import * as fb from '~/firebase/firebase-worker'
import * as ls from '~/local-storage-api'
import { GameResult } from '~/types/game-result'
import { SelectMyName } from '../select-my-name/select-my-name'
import { GameResultsView } from './game-results-view'

interface IChkChg {
  numPlayers: number
  checked: boolean
}

const Loading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 20px;
`
const numPlayersList = I.List([2, 3, 4, 5, 6])

export const GameResults = memo(() => {
  /* from events */

  const [dateBeginInput$, setDateBeginInput] = useStateAsStream(Date.now())
  const [dateEndInput$, setDateEndInput] = useStateAsStream(Date.now())
  const [resetAllClick$, resetAllClick] = useEventAsStream()
  const [latestClick$, latestClick] = useEventAsStream()

  // prettier-ignore
  const [numPlayersCheckInput$, numPlayersCheckInput]
    = useStateAsStream<IChkChg>({ checked: false, numPlayers: 4 })

  /* streams */

  const firstDateInGRList$: RN<number> = useRN(
    fb.gameResults$
      .map((grlist) =>
        date.toMidnightTimestamp(grlist.first(GameResult()).date),
      )
      .skipUnchanged(),
  )

  const latestDateInGRList$: RN<number> = useRN(
    fb.gameResults$
      .map((grlist) => date.toMidnightTimestamp(grlist.last(GameResult()).date))
      .skipUnchanged(),
  )

  const dateBegin$: RN<number> = useRN(
    merge(
      firstDateInGRList$,
      resetAllClick$
        .withLatest(firstDateInGRList$)
        .map(([_, firstDate]) => firstDate),
      latestClick$
        .withLatest(latestDateInGRList$)
        .map(([_, latestDate]) => latestDate),
      dateBeginInput$,
    ),
  )

  const dateEnd$: RN<number> = useRN(
    merge(
      latestDateInGRList$, // initialize
      resetAllClick$
        .withLatest(latestDateInGRList$)
        .map(([_, latestDate]) => latestDate),
      latestClick$
        .withLatest(latestDateInGRList$)
        .map(([_, latestDate]) => latestDate),
      dateEndInput$,
    ),
  )

  const numPlayersCheckedValues$: RN<I.Set<number>> = useRN(
    merge(numPlayersCheckInput$, resetAllClick$.mapTo<'reset'>('reset')).scan(
      I.Set<number>(numPlayersList),
      (s: I.Set<number>, v: 'reset' | IChkChg): I.Set<number> =>
        v === 'reset'
          ? I.Set(numPlayersList)
          : v.checked
          ? s.add(v.numPlayers)
          : s.delete(v.numPlayers),
    ),
  )

  const numPlayersOptions$ = useRN(
    numPlayersCheckedValues$.map((s) =>
      numPlayersList.map((e) => ({ numPlayers: e, checked: s.has(e) })),
    ),
  )

  const gameResultsFiltered$ = useRN(
    combine(
      fb.gameResults$,
      dateBegin$,
      dateEnd$,
      numPlayersCheckedValues$,
    ).map(([GR, dBegin, dEnd, numPlayersChecked]) =>
      GR.filter((g) => {
        const mDate = date.toMidnightTimestamp(g.date)
        return (
          mDate >= dBegin &&
          mDate <= dEnd &&
          numPlayersChecked.has(g.players.size)
        )
      }),
    ),
  )

  /* extract values */

  const myName = useRNValue(ls.myName$)
  const gameResults = useRNValue(fb.gameResults$)
  const gameResultsFiltered = useRNValue(gameResultsFiltered$)
  const dateBegin = useRNValue(dateBegin$)
  const dateEnd = useRNValue(dateEnd$)
  const numPlayersOptions = useRNValue(numPlayersOptions$)

  return (
    <div>
      {!myName ? (
        <SelectMyName />
      ) : gameResults.isEmpty() ? (
        <Loading>
          <CircularProgress />
        </Loading>
      ) : (
        <GameResultsView
          gameResultsFiltered={gameResultsFiltered}
          dateBegin={dateBegin}
          dateBeginChange={setDateBeginInput}
          dateEnd={dateEnd}
          dateEndChange={setDateEndInput}
          latestClick={latestClick}
          resetAllClick={resetAllClick}
          numPlayersOptions={numPlayersOptions}
          numPlayerCheck={numPlayersCheckInput}
        />
      )}
    </div>
  )
})

GameResults.displayName = 'GameResults'

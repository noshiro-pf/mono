import * as I from 'immutable'
import React, { memo, useCallback, useState } from 'react'
import { useRNValue } from 'rnjs-hooks'
import { placeListFromGameResults$ } from '~/firebase/firebase-combined-values'
import { TPlayerResultChange } from '~/types/player-result-change'
import { AddGameResultView } from './add-game-result-view'

export const AddGameResult = memo(() => {
  /* database */
  const placeList = useRNValue(placeListFromGameResults$)
  console.log(placeList.toJS())
  /* states */

  const [VPCalcIsOpen, setVPCalcIsOpen] = useState(false)
  const [userListIsOpen, setUserListIsOpen] = useState(false)

  const [date, setDate] = useState(new Date().toLocaleString())
  const [place, setPlace] = useState('')
  const [memo, setMemo] = useState('')
  console.log(place)
  /* events */

  // prettier-ignore
  const openVPCalc
      = useCallback(() => { setVPCalcIsOpen(true); }, [setVPCalcIsOpen]);
  // prettier-ignore
  const closeVPCalc
      = useCallback(() => { setVPCalcIsOpen(false); }, [setVPCalcIsOpen]);
  // prettier-ignore
  const VPCalcOkClicked
      = useCallback(() => { setVPCalcIsOpen(false); }, [setVPCalcIsOpen]);
  // prettier-ignore
  const VPCalcCancelClicked
      = useCallback(() => { setVPCalcIsOpen(false); }, [setVPCalcIsOpen]);

  const openUserList = useCallback(() => {
    setUserListIsOpen(true)
  }, [setUserListIsOpen])
  // prettier-ignore
  const closeUserList
      = useCallback(() =>{ setUserListIsOpen(false); }, [setUserListIsOpen]);
  // prettier-ignore
  const userListOkClicked
      = useCallback(() => { setUserListIsOpen(false); }, [setUserListIsOpen]);
  // prettier-ignore
  const userListCancelClicked
      = useCallback(() => { setUserListIsOpen(false); }, [setUserListIsOpen]);

  const lastTurnPlayer = ''
  const lastTurnPlayerChange = (_v: string) => {}
  const playerResults = I.List()
  const playerResultChange = (_v: TPlayerResultChange) => {}

  return (
    <AddGameResultView
      VPCalcIsOpen={VPCalcIsOpen}
      openVPCalc={openVPCalc}
      closeVPCalc={closeVPCalc}
      VPCalcOkClicked={VPCalcOkClicked}
      VPCalcCancelClicked={VPCalcCancelClicked}
      userListIsOpen={userListIsOpen}
      openUserList={openUserList}
      closeUserList={closeUserList}
      userListOkClicked={userListOkClicked}
      userListCancelClicked={userListCancelClicked}
      place={place}
      placeList={placeList}
      placeChange={setPlace}
      date={date}
      dateChange={setDate}
      memo={memo}
      memoChange={setMemo}
      lastTurnPlayer={lastTurnPlayer}
      lastTurnPlayerChange={lastTurnPlayerChange}
      playerResults={playerResults}
      playerResultChange={playerResultChange}
    />
  )
})

AddGameResult.displayName = 'AddGameResult'

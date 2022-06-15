import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core'
import * as I from 'immutable'
import { memo } from 'react'
import styled from 'styled-components'
import { TPlayerResultChange } from '~/types/player-result-change'
import { TPlayerResultRanked } from '~/types/player-result-ranked'
import { GamePlayedDate } from '../../sub-components/game-result-sub-components/game-played-date'
import { GameResultMemo } from '../../sub-components/game-result-sub-components/game-result-memo'
import { GameResultPlace } from '../../sub-components/game-result-sub-components/game-result-place'
import { PlayerResultTable } from '../../sub-components/game-result-sub-components/player-result-table/player-result-table'
import { VictoryPointsCalculator } from '../victory-points-calculator/victory-points-calculator'

const Item = styled.div`
  margin: 10px;
`

export const AddGameResultView = memo(
  ({
    VPCalcIsOpen,
    openVPCalc,
    closeVPCalc,
    VPCalcOkClicked,
    VPCalcCancelClicked,

    userListIsOpen,
    openUserList,
    closeUserList,
    userListOkClicked,
    userListCancelClicked,

    place,
    placeList,
    placeChange,
    date,
    dateChange,
    memo,
    memoChange,
    lastTurnPlayer,
    lastTurnPlayerChange,
    playerResults,
    playerResultChange,
  }: Readonly<{
    VPCalcIsOpen: boolean
    openVPCalc: () => void
    closeVPCalc: () => void
    VPCalcOkClicked: () => void
    VPCalcCancelClicked: () => void

    userListIsOpen: boolean
    openUserList: () => void
    closeUserList: () => void
    userListOkClicked: () => void
    userListCancelClicked: () => void

    place: string
    placeList: I.List<string>
    placeChange: (value: string) => void

    date: string
    dateChange: (value: string) => void
    memo: string
    memoChange: (value: string) => void
    lastTurnPlayer: string
    lastTurnPlayerChange: (value: string) => void
    playerResults: I.List<TPlayerResultRanked>
    playerResultChange: (chg: TPlayerResultChange) => void
  }>) => (
    <>
      <div>
        <Item>
          <GamePlayedDate editMode={true} date={date} dateChange={dateChange} />
        </Item>
        <Item>
          <GameResultPlace
            editMode={true}
            place={place}
            placeList={placeList}
            placeChange={placeChange}
          />
        </Item>
        <Item>
          <PlayerResultTable
            editMode={true}
            lastTurnPlayer={lastTurnPlayer}
            playerResults={playerResults}
            lastTurnPlayerChange={lastTurnPlayerChange}
            playerResultChange={playerResultChange}
          />
        </Item>
        <Item>
          <GameResultMemo editMode={true} memo={memo} memoChange={memoChange} />
        </Item>
      </div>

      <Button onClick={openUserList}>Select Players</Button>
      <Button onClick={openVPCalc}>VP calc</Button>

      <Dialog open={VPCalcIsOpen} onClose={closeVPCalc}>
        <DialogContent>
          <VictoryPointsCalculator playerName={'a'} />
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='primary' onClick={VPCalcOkClicked}>
            OK
          </Button>
          <Button
            variant='outlined'
            color='default'
            onClick={VPCalcCancelClicked}
          >
            cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={userListIsOpen} onClose={closeUserList}>
        <DialogContent>
          <VictoryPointsCalculator playerName={'a'} />
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            color='primary'
            onClick={userListOkClicked}
          >
            OK
          </Button>
          <Button
            variant='outlined'
            color='default'
            onClick={userListCancelClicked}
          >
            cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
)

import { Paper, Table, TableCell, TableHead, TableRow } from '@material-ui/core'
import * as I from 'immutable'
import { memo } from 'react'
import styled from 'styled-components'
import { TPlayerResultChange } from '~/types/player-result-change'
import { TPlayerResultRanked } from '~/types/player-result-ranked'
import { PlayerResultTableBodyEditMode } from './table-body-edit-mode'
import { PlayerResultTableBodyNormal } from './table-body-normal'

const TableWrapper = styled.div`
  overflow-x: auto;
`

const tableHead: I.List<string> = I.List([
  '順位',
  '名前',
  'VP',
  'スコア',
  '席順',
  '最後のプレイヤー',
])

export const PlayerResultTable = memo(
  ({
    editMode,
    lastTurnPlayer,
    playerResults,
    lastTurnPlayerChange,
    playerResultChange,
  }: Readonly<{
    editMode: boolean
    lastTurnPlayer: string
    playerResults: I.List<TPlayerResultRanked>
    lastTurnPlayerChange: (value: string) => void
    playerResultChange: (chg: TPlayerResultChange) => void
  }>) => (
    <Paper elevation={1}>
      <TableWrapper>
        <Table>
          <TableHead>
            <TableRow>
              {tableHead.map((label, ci) => (
                <TableCell
                  key={ci}
                  align='center'
                  padding='none'
                  variant='head'
                  style={label === '名前' ? { minWidth: '100px' } : {}}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {editMode ? (
            <PlayerResultTableBodyEditMode
              lastTurnPlayer={lastTurnPlayer}
              playerResults={playerResults}
              lastTurnPlayerChange={lastTurnPlayerChange}
              playerResultChange={playerResultChange}
            />
          ) : (
            <PlayerResultTableBodyNormal
              lastTurnPlayer={lastTurnPlayer}
              playerResults={playerResults}
            />
          )}
        </Table>
      </TableWrapper>
    </Paper>
  )
)

PlayerResultTable.displayName = 'PlayerResultTable'

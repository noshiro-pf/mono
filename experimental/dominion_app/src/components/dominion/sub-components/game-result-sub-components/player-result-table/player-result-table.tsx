import React, { memo } from 'react'
import * as I from 'immutable'
import styled from 'styled-components'
import { Paper, Table, TableHead, TableCell, TableRow } from '@material-ui/core'

import { TPlayerResultRanked } from '~/types/player-result-ranked'
import { TPlayerResultChange } from '~/types/player-result-change'

import { PlayerResultTableBodyNormal } from './table-body-normal'
import { PlayerResultTableBodyEditMode } from './table-body-edit-mode'

const TableWrapper = styled.div`
  overflow-x: auto;
`

const tableHead: I.List<string> = I.List([
  '順位',
  '名前',
  'VP',
  'スコア',
  '席順',
  '最後のプレイヤー'
])

export const PlayerResultTable = memo(
  ({
    editMode,
    lastTurnPlayer,
    playerResults,
    lastTurnPlayerChange,
    playerResultChange
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

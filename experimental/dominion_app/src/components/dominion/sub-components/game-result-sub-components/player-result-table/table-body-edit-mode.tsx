import {
  IconButton,
  Radio,
  TableBody,
  TableCell,
  TableRow,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import * as I from 'immutable'
import React, { memo, useCallback } from 'react'
import styled from 'styled-components'
import {
  PlayerResultChange,
  TPlayerResultChange,
} from '~/types/player-result-change'
import { TPlayerResultRanked } from '~/types/player-result-ranked'
import { MyInput } from '~/utils/components/native-input'

const TurnOrderBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const PlayerResultTableBodyEditMode = memo(
  ({
    lastTurnPlayer,
    playerResults,
    lastTurnPlayerChange,
    playerResultChange,
  }: Readonly<{
    playerResults: I.List<TPlayerResultRanked>
    lastTurnPlayer: string
    lastTurnPlayerChange: (value: string) => void
    playerResultChange: (chg: TPlayerResultChange) => void
  }>) => {
    const onChange = useCallback(
      (playerIndex: number, key: keyof TPlayerResultRanked) =>
        (value: string) => {
          playerResultChange(
            PlayerResultChange({
              playerIndex,
              key,
              value: key === 'VP' ? parseInt(value, 10) : value.toString(),
            })
          )
        },
      [playerResultChange]
    )

    const turnOrderOnClick = useCallback(
      (playerIndex: number, value: number) => () => {
        playerResultChange(
          PlayerResultChange({
            playerIndex,
            key: 'turnOrder',
            value,
          })
        )
      },
      [playerResultChange]
    )

    const lastPlayerTurnOnChange = useCallback(
      (name: string) => () => lastTurnPlayerChange(name),
      [lastTurnPlayerChange]
    )

    return (
      <TableBody>
        {playerResults.map((pr, ri) => (
          <TableRow key={ri}>
            <TableCell align='center'>{pr.rank}</TableCell>
            <TableCell align='center'>
              <MyInput
                style={{ width: '70px' }}
                label=''
                value={pr.name}
                valueChange={onChange(ri, 'name')}
              />
            </TableCell>
            <TableCell align='center'>
              <MyInput
                style={{ width: '50px' }}
                label=''
                type='number'
                value={pr.VP}
                valueChange={onChange(ri, 'VP')}
              />
            </TableCell>
            <TableCell align='center'>{pr.score}</TableCell>
            <TableCell align='center'>
              <TurnOrderBox>
                <IconButton
                  color='default'
                  disabled={pr.turnOrder === 1}
                  onClick={turnOrderOnClick(ri, -1)}
                >
                  <RemoveIcon />
                </IconButton>
                <div style={{ padding: '5px' }}>{pr.turnOrder}</div>
                <IconButton
                  color='default'
                  style={{ fontSize: '20px' }}
                  disabled={pr.turnOrder === playerResults.size}
                  onClick={turnOrderOnClick(ri, 1)}
                >
                  <AddIcon />
                </IconButton>
              </TurnOrderBox>
            </TableCell>
            <TableCell align='center'>
              <Radio
                checked={pr.name === lastTurnPlayer}
                onChange={lastPlayerTurnOnChange(pr.name)}
                value={ri}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    )
  }
)

PlayerResultTableBodyEditMode.displayName = 'PlayerResultTableBodyEditMode'

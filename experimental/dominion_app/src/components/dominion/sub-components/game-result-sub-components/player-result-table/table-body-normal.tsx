import { TableBody, TableCell, TableRow } from '@material-ui/core'
import * as I from 'immutable'
import { memo } from 'react'
import { TPlayerResultRanked } from '~/types/player-result-ranked'

export const PlayerResultTableBodyNormal = memo(
  ({
    playerResults,
    lastTurnPlayer,
  }: Readonly<{
    playerResults: I.List<TPlayerResultRanked>
    lastTurnPlayer: string
  }>) => {
    const tableBody: I.List<I.List<any>> = playerResults.map((p) =>
      I.List([
        p.rank,
        p.name,
        p.VP,
        p.score,
        p.turnOrder,
        p.name === lastTurnPlayer ? 'o' : '',
      ]),
    )

    return (
      <TableBody>
        {tableBody.map((row, ri) => (
          <TableRow key={ri}>
            {row.map((cell, ci) => (
              <TableCell key={ci} align='center'>
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    )
  },
)

PlayerResultTableBodyNormal.displayName = 'PlayerResultTableBodyNormal'

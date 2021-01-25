import { Paper, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import * as I from 'immutable'
import React, { memo } from 'react'
import { TDCardProperty } from '~/types/dcard-property'
import { properties } from './properties'

const CARD_LIST_LINK = 'http://suka.s5.xrea.com/dom/list.cgi?mode=show&id='

export const DCardPropertyDialogTable = memo(
  ({
    card,
    cardForView,
  }: Readonly<{
    card: TDCardProperty
    cardForView: I.Map<string, string>
  }>) => (
    <Paper>
      <Table>
        <TableBody>
          {properties.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{cardForView.get(p.memberName) || ''}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell />
            <TableCell>
              {card.linkId >= 0 && (
                <div>
                  <a
                    href={`${CARD_LIST_LINK}${card.linkId}`}
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    カードリスト
                  </a>
                </div>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  )
)

DCardPropertyDialogTable.displayName = 'DCardPropertyDialogTable'

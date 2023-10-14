import * as I from 'immutable'
import { memo, useCallback, useState } from 'react'
import {
  ColumnSetting,
  DataTable,
  ICellPosition,
  SortState,
  TableSettings,
} from 'react-data-table'
import { useRNValue } from 'rnjs-hooks'
import * as fbc from '~/firebase/firebase-combined-values'
import * as fb from '~/firebase/firebase-worker'
import { GameResult, TGameResult } from '~/types/game-result'
import { GameResultDialog } from '../../sub-components/game-result-dialog/game-result-dialog'

const settings = TableSettings({
  displayNo: false,
  usepagination: true,
  itemsPerPageInit: 25,
  itemsPerPageOptions: I.List([25, 50, 100, 200, 400]),
  sortInit: SortState({ activeColumnId: 0, activeCellState: 'desc' }),
  columnSettings: I.List([
    ColumnSetting({
      label: '日付',
      sort: 'number',
    }),
    ColumnSetting({
      label: '場所',
      filterType: 'select',
    }),
    ColumnSetting({
      label: '順位（クリックすると詳細を表示します）',
      align: 'left',
      isButton: true,
    }),
  ]),
})

const toYMDslashed = (e: string) => {
  const date = new Date(e)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

export const GameResultList = memo(
  ({
    gameResultsFiltered,
  }: Readonly<{
    gameResultsFiltered: I.List<TGameResult>
  }>) => {
    const table = gameResultsFiltered.map((gr) =>
      I.List([
        toYMDslashed(gr.date),
        gr.place,
        gr.players.map((p) => `${p.rank}. ${p.name}(${p.VP})`).join('，'),
      ]),
    )

    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    const [selectedGameResult, setSelectedGameResult] = useState<TGameResult>(
      GameResult(),
    )

    const closeDialog = useCallback(() => {
      setDialogIsOpen(false)
    }, [setDialogIsOpen])

    const cellClick = useCallback(
      (pos: ICellPosition) => {
        setSelectedGameResult(
          gameResultsFiltered.get(pos.rowIndex, GameResult()),
        )
        setDialogIsOpen(true)
      },
      [gameResultsFiltered, setDialogIsOpen, setSelectedGameResult],
    )

    const expansions = useRNValue(fb.expansions$)
    const cardIdToDCardProperty = useRNValue(fbc.cardIdToDCardProperty$)

    return (
      <>
        <DataTable table={table} settings={settings} cellClick={cellClick} />
        <GameResultDialog
          isOpen={dialogIsOpen}
          closeDialog={closeDialog}
          gameResult={selectedGameResult}
          expansions={expansions}
          cardIdToDCardProperty={cardIdToDCardProperty}
        />
      </>
    )
  },
)

GameResultList.displayName = 'GameResultList'

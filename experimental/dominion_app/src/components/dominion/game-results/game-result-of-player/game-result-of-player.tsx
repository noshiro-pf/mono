import * as I from 'immutable'
import { memo } from 'react'
import {
  ColumnSetting,
  DataTable,
  SortState,
  TableSettings,
} from 'react-data-table'
import * as num from 'typescript-utils/functions/number'
import { TGameResult } from '~/types/game-result'
import { allPlayerGameResults } from './all-player-game-results'

const numRankOption = I.List(num.numSeq(1, 6))

export const GameResultOfPlayer = memo(
  ({
    gameResultsFiltered,
  }: Readonly<{
    gameResultsFiltered: I.List<TGameResult>
  }>) => {
    const settings = TableSettings({
      displayNo: false,
      usepagination: false,
      sortInit: SortState({ activeColumnId: 1, activeCellState: 'asc' }),
      columnSettings: I.List([
        ColumnSetting({
          align: 'center',
          sort: 'string',
          label: '名前',
        }),
        ColumnSetting({
          sort: 'number-reverse',
          label: '平均得点',
          cellToStr: (e) => num.roundAt(e, 3).toString(),
        }),
        ColumnSetting({
          sort: 'number-reverse',
          label: '総得点',
          cellToStr: (e) => num.roundAt(e, 3).toString(),
        }),
        ColumnSetting({
          sort: 'number-reverse',
          label: '総対戦回数',
        }),
      ]).concat(
        numRankOption.map((i) =>
          ColumnSetting({
            sort: 'number-reverse',
            label: `${i}位回数`,
          })
        )
      ),
    })

    const table = allPlayerGameResults(gameResultsFiltered).map((obj) =>
      I.List([obj.name, obj.scoreAverage, obj.scoreSum, obj.count]).concat(
        numRankOption.map((i) => obj.numEachRank.get(i))
      )
    )

    return <DataTable table={table} settings={settings} />
  }
)

GameResultOfPlayer.displayName = 'GameResultOfPlayer'

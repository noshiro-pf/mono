import { CircularProgress } from '@material-ui/core'
import * as I from 'immutable'
import { memo, useMemo } from 'react'
import { ColumnSetting, DataTable, TableSettings } from 'react-data-table'
import { useRNValue } from 'rnjs-hooks'
import styled from 'styled-components'
import * as fb from '~/firebase/firebase-worker'

const Loading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const settings = TableSettings({
  displayNo: false,
  usepagination: false,
  columnSettings: I.List([
    ColumnSetting({ label: 'プレイヤー数' }),
    ColumnSetting({ label: '1位' }),
    ColumnSetting({ label: '2位' }),
    ColumnSetting({ label: '3位' }),
    ColumnSetting({ label: '4位' }),
    ColumnSetting({ label: '5位' }),
    ColumnSetting({ label: '6位' }),
  ]),
})

export const ScoreTable = memo(() => {
  const scoreTableForView$ = useMemo(
    () =>
      fb.scoreTable$.map((scoringTable) =>
        scoringTable
          .map((value, index) => ({ numPlayers: index, score: value }))
          .filter((e) => e.score.get(1, -1) > 0)
          .map((e) =>
            I.List([
              e.numPlayers.toString(),
              e.score.get(1, -1) < 0 ? '' : e.score.get(1, 0).toString(),
              e.score.get(2, -1) < 0 ? '' : e.score.get(2, 0).toString(),
              e.score.get(3, -1) < 0 ? '' : e.score.get(3, 0).toString(),
              e.score.get(4, -1) < 0 ? '' : e.score.get(4, 0).toString(),
              e.score.get(5, -1) < 0 ? '' : e.score.get(5, 0).toString(),
              e.score.get(6, -1) < 0 ? '' : e.score.get(6, 0).toString(),
            ]),
          ),
      ),
    [],
  )

  const scoreTableForView = useRNValue(scoreTableForView$)

  return !scoreTableForView || scoreTableForView.isEmpty() ? (
    <Loading>
      <CircularProgress />
    </Loading>
  ) : (
    <DataTable table={scoreTableForView} settings={settings} />
  )
})

ScoreTable.displayName = 'ScoreTable'

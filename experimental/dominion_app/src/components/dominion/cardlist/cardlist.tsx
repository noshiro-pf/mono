import * as I from 'immutable'
import { memo, useCallback, useMemo, useState } from 'react'
import {
  ICellPosition,
  TDataTableState,
  TTableSettings,
} from 'react-data-table'
import { RN } from 'rnjs'
import { useRNValue } from 'rnjs-hooks'
import * as fb from '~/firebase/firebase-worker'
import { DCardPropertyListDialog } from '../sub-components/dcard-property-dialog/dcard-property-list-dialog'
import { cardlistTableSettings } from './cardlist-table-settings'
import { CardListView } from './cardlist-view'

export const CardList = memo(() => {
  const table$: RN<I.List<I.List<any>>> = useMemo(
    () =>
      fb.dcardlist$.map((list) =>
        list.map((dc) =>
          I.List([
            dc.nameJp, // '名前'
            dc.nameEng, // 'Name'
            dc.expansionName, // 'セット名'
            dc.category, // '分類'
            dc.cardTypes, // '種別'
            dc.effects.cost, // 'コスト'
            dc.effects.VP, // 'VP'
            dc.effects.drawCard, // '+card'
            dc.effects.action, // '+action'
            dc.effects.buy, // '+buy'
            dc.effects.coin, // '+coin'
            dc.effects.VPtoken, // '+VPtoken'
            dc.effects.coffer, // '+coffer'
            dc.effects.villager, // '+villager'
            dc.implemented, // 'ゲーム実装状況'
            dc.randomizerCandidate, // 'ランダマイザー対象'
          ])
        )
      ),
    []
  )

  const cardlistSettings$: RN<TTableSettings> = useMemo(
    () =>
      fb.expansions$.map((expansions) =>
        cardlistTableSettings(
          expansions.reduce((m, v, i) => m.set(v, i), I.Map<string, number>())
        )
      ),
    []
  )

  const table = useRNValue(table$)
  const settings = useRNValue(cardlistSettings$)

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [indexInDialog, setIndexInDialog] = useState<number>(0)
  const [filteredIndice, setFilteredIndice] = useState<I.List<number>>(I.List())

  const cellClick = useCallback(
    (pos: ICellPosition) => {
      setDialogOpen(true)
      setIndexInDialog(pos.rowIndexInFilteredIndice)
    },
    [setDialogOpen, setIndexInDialog]
  )

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
  }, [setDialogOpen])

  const tableStateChange = useCallback(
    (s: TDataTableState) => {
      if (!I.is(filteredIndice, s.filteredIndice)) {
        setFilteredIndice(s.filteredIndice)
      }
    },
    [filteredIndice, setFilteredIndice]
  )

  return (
    <div>
      <CardListView
        table={table}
        settings={settings}
        cellClick={cellClick}
        tableStateChange={tableStateChange}
      />
      <DCardPropertyListDialog
        key={Date.now()}
        open={dialogOpen}
        closeDialog={closeDialog}
        filteredIndice={filteredIndice}
        indexInFilteredListInit={indexInDialog}
      />
    </div>
  )
})

CardList.displayName = 'CardList'

import * as I from 'immutable'
import { ColumnSetting, TableSettings } from 'react-data-table'
import * as bool from 'typescript-utils/functions/boolean'
import * as list from 'typescript-utils/functions/list'
import {
  dcardTypeToJpStr,
  implementedToStr,
  randomizerCandidateToStr,
} from '~/functions/transform-card-property'
import { cmpCardCost, dcardCostToStr } from '~/types/card-cost'
import { DCardType } from '~/types/card-type'

export const cardlistTableSettings = (setNameIndex: I.Map<string, number>) =>
  TableSettings({
    displayNo: true,
    usepagination: true,
    itemsPerPageInit: 25,
    itemsPerPageOptions: I.List([25, 50, 100, 200]),
    columnSettings: I.List([
      ColumnSetting({
        cellType: 'string',
        filterType: 'input',
        label: '名前',
        isButton: true,
        sort: 'string',
      }),
      ColumnSetting({
        cellType: 'string',
        filterType: 'input',
        label: 'Name',
        sort: 'string',
      }),
      ColumnSetting({
        cellType: 'string[]',
        filterType: 'multiSelect-or',
        label: 'セット名',
        sort: list.lexicalCmp(
          (a: string, b: string): number =>
            setNameIndex.get(a, -1) - setNameIndex.get(b, -1)
        ),
        cellToStr: (names: I.List<string>) => names.join('，'),
      }),
      ColumnSetting({
        cellType: 'string',
        filterType: 'select',
        label: '分類',
        sort: 'string',
      }),
      ColumnSetting({
        cellType: 'string[]',
        filterType: 'multiSelect-and',
        label: '種別',
        sort: 'string-lex',
        cellToStr: (values: I.List<DCardType>) =>
          values.map(dcardTypeToJpStr).join('，'),
      }),
      ColumnSetting({
        cellType: 'others',
        filterType: 'none',
        label: 'コスト',
        sort: cmpCardCost,
        cellToStr: dcardCostToStr,
      }),
      ColumnSetting({
        cellType: 'number',
        filterType: 'none',
        align: 'center',
        label: 'VP',
        sort: 'number',
      }),
      ColumnSetting({
        cellType: 'number',
        filterType: 'none',
        align: 'center',
        label: '+card',
        sort: 'number',
      }),
      ColumnSetting({
        cellType: 'number',
        filterType: 'none',
        align: 'center',
        label: '+action',
        sort: 'number',
      }),
      ColumnSetting({
        cellType: 'number',
        filterType: 'none',
        align: 'center',
        label: '+buy',
        sort: 'number',
      }),
      ColumnSetting({
        cellType: 'number',
        filterType: 'none',
        align: 'center',
        label: '+coin',
        sort: 'number',
      }),
      ColumnSetting({
        cellType: 'number',
        filterType: 'none',
        align: 'center',
        label: '+VPtoken',
        sort: 'number',
      }),
      ColumnSetting({
        cellType: 'number',
        filterType: 'none',
        align: 'center',
        label: '+Coffer',
        sort: 'number',
      }),
      ColumnSetting({
        cellType: 'number',
        filterType: 'none',
        align: 'center',
        label: '+Villager',
        sort: 'number',
      }),
      ColumnSetting({
        cellType: 'others',
        filterType: 'select',
        label: 'ゲーム実装状況',
        cellToStr: implementedToStr,
        sort: bool.cmp,
      }),
      ColumnSetting({
        cellType: 'others',
        filterType: 'select',
        label: 'ランダマイザー対象',
        cellToStr: randomizerCandidateToStr,
        sort: bool.cmp,
      }),
    ]),
  })

import * as I from 'immutable'

export const properties: I.List<{ memberName: string; name: string }> = I.List([
  { memberName: 'nameJp', name: '和名' },
  { memberName: 'nameJpYomi', name: '読み' },
  { memberName: 'nameEng', name: '英名' },
  { memberName: 'expansionName', name: 'セット' },
  { memberName: 'cost_coin', name: 'コスト（コイン）' },
  { memberName: 'cost_potion', name: 'コスト（ポーション）' },
  { memberName: 'cost_debt', name: 'コスト（借金）' },
  { memberName: 'category', name: '種類' },
  { memberName: 'cardTypesStr', name: '属性' },
  { memberName: 'VP', name: 'VP' },
  { memberName: 'drawCard', name: '+Draw Cards' },
  { memberName: 'action', name: '+Action' },
  { memberName: 'buy', name: '+Buy' },
  { memberName: 'coin', name: '+Coin' },
  { memberName: 'VPtoken', name: '+VP-token' },
  { memberName: 'coffer', name: '+Coffer' },
  { memberName: 'villager', name: '+Villager' },
  { memberName: 'implemented', name: 'オンラインゲーム実装状況' },
])

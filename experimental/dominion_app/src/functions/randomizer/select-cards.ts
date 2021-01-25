import * as I from 'immutable'
import { TDCardProperty } from '~/types/dcard-property'
import { SelectedCards, TSelectedCards } from '~/types/selected-cards'
import { getDcardsInSelectedExpansionsWithIndex } from './get-shuffled-dcardlist'
import { ProperityDarkAges } from './properity_dark-ages'
import { selectBaneCard } from './select-bane-card'
import { selectBlackMarketPile } from './select-blackmarket'
import { selectKingdomCards } from './select-kingdom-cards'
import { selectObelisk } from './select-obelisk'

export const selectCards = (
  selectedExpansions: I.List<string>,
  dcardlist: I.List<TDCardProperty>
): TSelectedCards | 'error' => {
  // selectedCardsTemp.date = new Date();

  // 選択されている拡張セットに含まれているカードすべてをindexとペアにしたリスト
  const dcardsInSelectedExpansions = getDcardsInSelectedExpansionsWithIndex(
    dcardlist,
    selectedExpansions
  )

  // シャッフルして先頭から出力するジェネレーター
  function* shuffledDcardsGeneratorFn() {
    const shuffled = dcardsInSelectedExpansions.sortBy(() => Math.random())
    let i = 0
    while (true) {
      yield shuffled.get(i)
      i += 1
    }
  }
  const shuffledDcardsGen = shuffledDcardsGeneratorFn()

  // 王国カード10枚の選定
  const selectKingdomCardsResult = selectKingdomCards(shuffledDcardsGen)
  if (selectKingdomCardsResult === 'error') {
    return 'error'
  }
  const { KingdomCards10, EventCards, LandmarkCards } = selectKingdomCardsResult

  // 繁栄場・避難所場の決定
  const { Prosperity, DarkAges } = ProperityDarkAges(dcardlist, KingdomCards10)

  // 災いカード（収穫祭：魔女娘）の選定
  const selectBaneCardResult = selectBaneCard(
    KingdomCards10,
    dcardlist,
    shuffledDcardsGen
  )
  if (selectBaneCardResult === 'error') {
    return 'error'
  }
  const BaneCard = selectBaneCardResult

  // Black Market (one copy of each Kingdom card not in the supply. 15種類選択を推奨)
  const selectBlackMarketPileResult = selectBlackMarketPile(
    KingdomCards10,
    BaneCard,
    dcardlist,
    shuffledDcardsGen
  )
  if (selectBlackMarketPileResult === 'error') {
    return 'error'
  }
  const BlackMarketPile = selectBlackMarketPileResult

  // Obelisk (Choose 1 Action Supply Pile)
  const Obelisk = selectObelisk(
    KingdomCards10,
    BaneCard,
    LandmarkCards,
    dcardlist
  )

  return SelectedCards({
    BaneCard,
    BlackMarketPile: BlackMarketPile.sort(),
    DarkAges,
    Prosperity,
    EventCards: EventCards.sort(),
    KingdomCards10: KingdomCards10.sort(), // （注）繁栄場・避難所場の決定後にソート
    LandmarkCards: LandmarkCards.sort(),
    Obelisk,
    timestamp: Date.now(),
  })
}

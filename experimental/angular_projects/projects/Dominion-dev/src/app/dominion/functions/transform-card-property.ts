import { CardCost } from '../types/card-cost';
import { CardProperty } from '../types/card-property';
import { CardType } from '../types/card-type';

export const cardTypeToJpStr = (cardType: CardType): string => {
  switch (cardType) {
    case 'Curse':
      return '呪い';
    case 'Action':
      return 'アクション';
    case 'Treasure':
      return '財宝';
    case 'Victory':
      return '勝利点';
    case 'Attack':
      return 'アタック';
    case 'Reaction':
      return 'リアクション';
    case 'Duration':
      return '持続';
    case 'Ruins':
      return '廃墟';
    case 'Prize':
      return '褒賞';
    case 'Looter':
      return '略奪者';
    case 'Shelter':
      return '避難所';
    case 'Knights':
      return '騎士';
    case 'Reserve':
      return 'リザーブ';
    case 'Traveller':
      return 'トラベラー';
    case 'Castle':
      return '城';
    case 'Gather':
      return '集合';
    case 'EventCards':
      return 'イベント';
    case 'LandmarkCards':
      return 'ランドマーク';
    default:
      return cardType;
  }
};

export const implementedToStr = (flag: boolean): string =>
  flag ? '実装済み' : '未実装';

export const randomizerCandidateToStr = (flag: boolean): string =>
  flag ? '〇' : '×';

export const cardCostToStr = (cost: CardCost): string => {
  let result = '';
  if (cost.coin > 0 || (cost.potion <= 0 && cost.debt <= 0)) {
    result += cost.coin.toString();
  }
  if (cost.potion > 0) {
    for (let i = 0; i < cost.potion; ++i) result += 'P';
  }
  if (cost.debt > 0) {
    result += `<${cost.debt.toString()}>`;
  }
  return result;
};

export const cardPropertyToStr = (
  cp: CardProperty
): { [key: string]: string } => ({
  indexInList: cp.indexInList.toString(),
  cardId: cp.cardId,
  nameJp: cp.nameJp,
  nameJpYomi: cp.nameJpYomi,
  nameEng: cp.nameEng,
  expansionName: cp.expansionName.join('，'),
  cost_coin: cp.cost.coin.toString(),
  cost_potion: cp.cost.potion.toString(),
  cost_debt: cp.cost.debt.toString(),
  costStr: cardCostToStr(cp.cost),
  category: cp.category,
  cardTypesStr: cp.cardTypes.map(cardTypeToJpStr).join('，'),
  cardTypes: cp.cardTypes.toString(),
  VP: cp.VP.toString(),
  drawCard: cp.drawCard.toString(),
  action: cp.action.toString(),
  buy: cp.buy.toString(),
  coin: cp.coin.toString(),
  VPtoken: cp.VPtoken.toString(),
  implemented: implementedToStr(cp.implemented),
  randomizerCandidate: randomizerCandidateToStr(cp.randomizerCandidate),
});

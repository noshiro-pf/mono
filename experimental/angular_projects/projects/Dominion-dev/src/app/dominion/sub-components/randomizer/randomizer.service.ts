import { Injectable } from '@angular/core';
import { FireDatabaseService } from '../../../database/database.service';
import { utils } from '../../../mylib/utilities';
import { CardProperty } from '../../types/card-property';
import { CardType } from '../../types/card-type';
import { SelectedCards } from '../../types/selected-cards';

@Injectable()
export class RandomizerService {
  private cardPropertyList!: CardProperty[];
  private expansionNameList!: string[];

  constructor(private database: FireDatabaseService) {
    this.database.cardPropertyList$.subscribe(
      (val) => (this.cardPropertyList = val),
    );

    this.database.expansionNameList$.subscribe(
      (val) => (this.expansionNameList = val),
    );
  }

  selectCards(implementedOnly: boolean, isSelectedExpansions: boolean[]) {
    const selectedCardsTemp = new SelectedCards();

    selectedCardsTemp.date = new Date();

    // 選択されている拡張セットに含まれているカードすべてをシャッフルし，indexとペアにしたリスト
    const CardsInSelectedSets_Shuffled: {
      index: number;
      data: CardProperty;
    }[] = utils.number.random.getShuffled(
      this.cardPropertyList
        .map((val: CardProperty, index: number) => ({
          index: index,
          data: val,
        }))
        .filter((e) => e.data.randomizerCandidate)
        .filter((e) => !implementedOnly || e.data.implemented)
        // "implementedOnly is true -> select implemented"
        .filter(
          (e) =>
            this.expansionNameList // selected expansion
              .filter((_, index) => isSelectedExpansions[index])
              .findIndex((name) => e.data.expansionName.includes(name)) >= 0,
        ),
    );

    // 10 Supply KingdomCards10 and Event, LandmarkCards
    while (selectedCardsTemp.KingdomCards10.length < 10) {
      const card = CardsInSelectedSets_Shuffled.pop();
      if (!card) return { valid: false, selectedCards: selectedCardsTemp };
      if (card.data.category === '王国') {
        selectedCardsTemp.KingdomCards10.push(card.index);
      }
      if (
        selectedCardsTemp.EventCards.length +
          selectedCardsTemp.LandmarkCards.length <
        2
      ) {
        if (card.data.cardTypes.includes('EventCards')) {
          selectedCardsTemp.EventCards.push(card.index);
        }
        if (card.data.cardTypes.includes('LandmarkCards')) {
          selectedCardsTemp.LandmarkCards.push(card.index);
        }
      }
    }

    // 繁栄場・避難所場の決定
    const firstSelectedCard =
      this.cardPropertyList[selectedCardsTemp.KingdomCards10[0]];
    const lastSelectedCard =
      this.cardPropertyList[selectedCardsTemp.KingdomCards10[9]];
    selectedCardsTemp.Prosperity =
      firstSelectedCard.expansionName.includes('繁栄');
    selectedCardsTemp.DarkAges =
      lastSelectedCard.expansionName.includes('暗黒時代');

    // 災いカード（収穫祭：魔女娘）
    if (
      selectedCardsTemp.KingdomCards10.map(
        (e) => this.cardPropertyList[e].nameJp,
      ).includes('魔女娘')
    ) {
      if (CardsInSelectedSets_Shuffled.length <= 0) {
        return { valid: false, selectedCards: selectedCardsTemp };
      }
      const cardIndex = (
        utils.array.removeIf(
          CardsInSelectedSets_Shuffled,
          (e) =>
            e.data.cost.debt <= 0 &&
            e.data.cost.potion <= 0 &&
            e.data.cost.coin >= 2 &&
            e.data.cost.coin <= 3,
        ) || { index: 0 }
      ).index;
      selectedCardsTemp.BaneCard = [cardIndex];
    }

    // Black Market (one copy of each Kingdom card not in the supply. 15種類選択を推奨)
    if (
      ([] as number[])
        .concat(selectedCardsTemp.KingdomCards10, selectedCardsTemp.BaneCard)
        .map((e) => this.cardPropertyList[e].nameJp)
        .includes('闇市場')
    ) {
      while (selectedCardsTemp.BlackMarketPile.length < 15) {
        const card = CardsInSelectedSets_Shuffled.pop();
        if (!card) return { valid: false, selectedCards: selectedCardsTemp };
        if (card.data.category === '王国') {
          selectedCardsTemp.BlackMarketPile.push(card.index);
        }
      }
    }

    // Obelisk (Choose 1 Action Supply Pile)
    if (
      selectedCardsTemp.LandmarkCards.map(
        (e) => this.cardPropertyList[e].nameEng,
      ).includes('Obelisk')
    ) {
      const cardIndex: number = (() => {
        const supplyUsed: number[] = ([] as number[]).concat(
          selectedCardsTemp.KingdomCards10,
          selectedCardsTemp.BaneCard,
        );
        const ObeliskCandidatesActionCards: number[] =
          utils.array.copy(supplyUsed);

        const ct: CardType[] = utils.array.flatten(
          supplyUsed.map((e) => this.cardPropertyList[e].cardTypes),
        );
        if (ct.includes('Looter')) {
          const ruinsIndex: number = this.cardPropertyList.findIndex(
            (e) => e.nameJp === '廃墟',
          );
          ObeliskCandidatesActionCards.unshift(ruinsIndex);
        }
        return utils.number.random.getRandomElement(supplyUsed);
      })();
      selectedCardsTemp.Obelisk = [cardIndex];
    }

    selectedCardsTemp.KingdomCards10.sort((a, b) => a - b); // 繁栄場・避難所場の決定後にソート
    selectedCardsTemp.EventCards.sort((a, b) => a - b);
    selectedCardsTemp.LandmarkCards.sort((a, b) => a - b);
    selectedCardsTemp.BlackMarketPile.sort((a, b) => a - b);

    return { valid: true, selectedCards: selectedCardsTemp };
  }
}

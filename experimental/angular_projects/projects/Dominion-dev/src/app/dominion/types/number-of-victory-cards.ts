import { CardProperty } from './card-property';

export class NumberOfVictoryCards {
  [key: string]: any;
  VPtoken: number = 0;
  others: number = 0;
  othersMinus: number = 0;

  Curse: number = 0; // -1
  Estate: number = 0; //  1
  Duchy: number = 0; //  3
  Province: number = 0; //  6
  Colony: number = 0; // 10
  Great_Hall: number = 0; //  1
  Nobles: number = 0; //  2
  Harem: number = 0; //  2
  Farmland: number = 0; //  2
  Island: number = 0; //  2
  Tunnel: number = 0; //  2
  Dame_Josephine: number = 0; //  2
  Overgrown_Estate: number = 0; //  0
  Mill: number = 0; //  1
  Cemetery: number = 0; //  2

  Gardens: number = 0;
  Duke: number = 0; // 公爵
  Vineyard: number = 0;
  Fairgrounds: number = 0; // 品評会
  Silk_Road: number = 0;
  Feodum: number = 0; // 封土
  Distant_Lands: number = 0;
  Pasture: number = 0;

  Humble_Castle: number = 0;
  Crumbling_Castle: number = 0;
  Small_Castle: number = 0;
  Haunted_Castle: number = 0;
  Opulent_Castle: number = 0;
  Sprawling_Castle: number = 0;
  Grand_Castle: number = 0;
  Kings_Castle: number = 0;

  DeckSize: number = 0; // for Gardens
  numberOfActionCards: number = 0; // for Vineyard
  numberOfDifferentlyNamedCards: number = 0; // for Fairgrounds
  numberOfSilvers: number = 0; // for Feodum
  Distant_Lands_on_TavernMat: number = 0; // for Distant_Lands

  constructor(initObj?: { [key: string]: any }) {
    if (!initObj) return;
    Object.keys(initObj).forEach((key) => (this[key] = initObj[key] || 0));
  }

  countVictoryCards(): number {
    return (
      0 +
      this.Estate +
      this.Duchy +
      this.Province +
      this.Colony +
      this.Great_Hall +
      this.Nobles +
      this.Harem +
      this.Farmland +
      this.Island +
      this.Tunnel +
      this.Dame_Josephine +
      this.Overgrown_Estate +
      this.Mill +
      this.Cemetery +
      this.Gardens +
      this.Duke +
      this.Vineyard +
      this.Fairgrounds +
      this.Silk_Road +
      this.Feodum +
      this.Distant_Lands +
      this.Pasture +
      this.countCastles()
    );
  }

  countCastles(): number {
    return (
      0 +
      this.Humble_Castle +
      this.Crumbling_Castle +
      this.Small_Castle +
      this.Haunted_Castle +
      this.Opulent_Castle +
      this.Sprawling_Castle +
      this.Grand_Castle +
      this.Kings_Castle
    );
  }

  VPtotal(): number {
    let VPtotal = 0;
    Object.keys(this).forEach((key) => (VPtotal += this.VPofCard(key)));
    return VPtotal;
  }

  VPofCard(name: string): number {
    return this[name] * this.VPperCard(name);
  }

  VPperCard(name: string): number {
    switch (name) {
      case 'VPtoken':
        return 1;
      case 'others':
        return 1;
      case 'othersMinus':
        return -1;
      case 'Curse':
        return -1;
      case 'Estate':
        return 1;
      case 'Duchy':
        return 3;
      case 'Province':
        return 6;
      case 'Colony':
        return 10;
      case 'Great_Hall':
        return 1;
      case 'Nobles':
        return 2;
      case 'Harem':
        return 2;
      case 'Farmland':
        return 2;
      case 'Island':
        return 2;
      case 'Tunnel':
        return 2;
      case 'Dame_Josephine':
        return 2;
      case 'Overgrown_Estate':
        return 0;
      case 'Mill':
        return 1;
      case 'Cemetery':
        return 2;

      // 庭園 : デッキ枚数 ÷ 10 点
      case 'Gardens':
        return Math.floor(this.DeckSize / 10);

      // 公爵 : 公領1枚につき1点
      case 'Duke':
        return this.Duchy;

      // ブドウ園 : アクションカード3枚につき1点
      case 'Vineyard':
        return Math.floor(this.numberOfActionCards / 3);

      // 品評会 : 異なる名前のカード5枚につき2勝利点
      case 'Fairgrounds':
        return 2 * Math.floor(this.numberOfDifferentlyNamedCards / 5);

      // シルクロード : 勝利点カード4枚につき1点
      case 'Silk_Road':
        return Math.floor(this.countVictoryCards() / 4);

      // // 封土 : 銀貨3枚につき1点
      case 'Feodum':
        return Math.floor(this.numberOfSilvers / 3);

      // 遠隔地 : 酒場マットの上にあれば4点，そうでなければ0点
      case 'Distant_Lands':
        return 0;
      case 'Distant_Lands_on_TavernMat':
        return 4;

      // Castles
      case 'Humble_Castle':
        return this.countCastles();
      case 'Crumbling_Castle':
        return 1;
      case 'Small_Castle':
        return 2;
      case 'Haunted_Castle':
        return 2;
      case 'Opulent_Castle':
        return 3;
      case 'Sprawling_Castle':
        return 4;
      case 'Grand_Castle':
        return 5;
      case 'Kings_Castle':
        return 2 * this.countCastles();

      // Pasture : 屋敷1枚につき1点
      case 'Pasture':
        return this.Estate;

      default:
        return 0;
    }
  }

  toStr(cardPropertyList: CardProperty[]): string {
    const result: string[] = [];

    if (this.VPtoken !== 0) result.push(`VPトークン(${this.VPtoken})`);
    if (this.others - this.othersMinus !== 0) {
      result.push(`その他(${this.others - this.othersMinus})`);
    }

    const toNameJp = (id: string) =>
      (cardPropertyList.find((e) => e.cardId === id) || new CardProperty())
        .nameJp;

    [
      'Curse',
      'Estate',
      'Duchy',
      'Province',
      'Colony',
      'Great_Hall',
      'Nobles',
      'Harem',
      'Farmland',
      'Island',
      'Tunnel',
      'Dame_Josephine',
      'Mill',
      'Cemetery',
      'Gardens',
      'Duke',
      'Vineyard',
      'Fairgrounds',
      'Silk_Road',
      'Feodum',
      'Distant_Lands',
      'Pasture',
    ].forEach((id) => {
      if (this[id] !== 0) {
        result.push(`${toNameJp(id)}(${this.VPperCard(id)}x${this[id]})`);
      }
    });

    const CastleVPtotal = [
      'Humble_Castle',
      'Crumbling_Castle',
      'Small_Castle',
      'Haunted_Castle',
      'Opulent_Castle',
      'Sprawling_Castle',
      'Grand_Castle',
      'Kings_Castle',
    ]
      .map((cardId) => this.VPperCard(cardId) * this[cardId])
      .reduce((prev, curr) => prev + curr);

    if (CastleVPtotal !== 0) {
      result.push(`城(${CastleVPtotal})`);
    }

    return result.join('，');
  }
}

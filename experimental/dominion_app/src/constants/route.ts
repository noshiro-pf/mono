import * as I from 'immutable'
import { Rulebook, TRulebook } from '~/types/rulebook'

export const routes = I.Record({
  home: '/',
  feedback: '/feedback',
  dominion: I.Record({
    randomizer: '/randomizer',
    gameResult: '/game-result',
    cardList: '/card-list',
    rulebooks: '/rulebooks',
  })(),
  selectMyName: '/select-my-name',
  adminDatabase: '/admin-database',
})()

export const rulebooksPath: I.List<TRulebook> = I.List([
  Rulebook({
    imgurl: '01_Dominion_Cover.png',
    pdfurl: 'Dominion_gameRules_01_Original.pdf',
    title: '01 - ドミニオン「基本」',
  }),
  Rulebook({
    imgurl: '02_Intrigue_Cover.png',
    pdfurl: 'Dominion_gameRules_02_Intrigue.pdf',
    title: '02 - ドミニオン「陰謀」',
  }),
  Rulebook({
    imgurl: '03_Seaside_Cover.png',
    pdfurl: 'Dominion_gameRules_03_Seaside.pdf',
    title: '03 - ドミニオン「海辺」',
  }),
  Rulebook({
    imgurl: '04_Alchemy_Cover.png',
    pdfurl: 'Dominion_gameRules_04_Alchemy.pdf',
    title: '04 - ドミニオン「錬金術」',
  }),
  Rulebook({
    imgurl: '05_Prosperity_Cover.png',
    pdfurl: 'Dominion_gameRules_05_Prosperity.pdf',
    title: '05 - ドミニオン「繁栄」',
  }),
  Rulebook({
    imgurl: '06_Cornucopia_Cover.png',
    pdfurl: 'Dominion_gameRules_06_Cornucopia.pdf',
    title: '06 - ドミニオン「収穫祭」',
  }),
  Rulebook({
    imgurl: '07_Hinterlands_Cover.png',
    pdfurl: 'Dominion_gameRules_07_Hinterlands.pdf',
    title: '07 - ドミニオン「異郷」',
  }),
  Rulebook({
    imgurl: '08_Dark_Ages_Cover.png',
    pdfurl: 'Dominion_gameRules_08_Dark_Ages.pdf',
    title: '08 - ドミニオン「暗黒時代」',
  }),
  Rulebook({
    imgurl: '09_Guilds_Cover.png',
    pdfurl: 'Dominion_gameRules_09_Guilds.pdf',
    title: '09 - ドミニオン「ギルド」',
  }),
  Rulebook({
    imgurl: '10_Adventures_Cover.png',
    pdfurl: 'Dominion_gameRules_10_Adventures.pdf',
    title: '10 - ドミニオン「冒険」',
  }),
  Rulebook({
    imgurl: '11_Empires_Cover.png',
    pdfurl: 'Dominion_gameRules_11_Empires.pdf',
    title: '11 - ドミニオン「帝国」',
  }),
  Rulebook({
    imgurl: '12_Dominion2nd_Cover.png',
    pdfurl: 'Dominion_gameRules_12_Dominion2nd.pdf',
    title: '12 - ドミニオン 第2版',
  }),
  Rulebook({
    imgurl: '13_Intrigue2nd_Cover.png',
    pdfurl: 'Dominion_gameRules_13_Intrigue2nd.pdf',
    title: '13 - ドミニオン「陰謀」 第2版',
  }),
  Rulebook({
    imgurl: '14_Nocturne_Cover.png',
    pdfurl: 'Dominion_gameRules_14_Nocturne.pdf',
    title: '14 - ドミニオン「夜想曲」',
  }),
  Rulebook({
    imgurl: '15_Renaissance_Cover.jpg',
    pdfurl: 'Dominion_gameRules_15_Renaissance.pdf',
    title: '15 - ドミニオン「ルネサンス」',
  }),
])

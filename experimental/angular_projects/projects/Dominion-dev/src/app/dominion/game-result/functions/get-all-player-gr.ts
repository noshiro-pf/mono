import { PlayerGR } from '../types/player-gr';
import { GameResult } from '../../types/game-result';


export const getAllPlayerGR = (
  GRlistFiltered: GameResult[]
): PlayerGR[] => {
  // get all player names
  const userNames = new Set<string>();
  GRlistFiltered.forEach( gr => gr.players.forEach( player => {
    userNames.add( player.name );
  }));

  // initialize
  const rankScoreSumObj: {
    [key: string]: {
        countRank: number[],
        scoreSum: number
      } } = {};

  userNames.forEach( name => {
    rankScoreSumObj[name] = {
      countRank    : [0, 0, 0, 0, 0, 0, 0],
      scoreSum     : 0.0,
    };
  } );

  // sum up rank & score of each player
  GRlistFiltered.forEach( gr => gr.players.forEach( player => {
    rankScoreSumObj[ player.name ].countRank[ player.rank ]++;
    rankScoreSumObj[ player.name ].scoreSum += player.score;
  }));

  // calculate countRank and score average
  const GRofEachPlayer: PlayerGR[]
    = Array.from( userNames ).map( uname => {
        const pl = rankScoreSumObj[ uname ];
        const count = pl.countRank.reduce( (a, b) => a + b, 0 );
        return {
          name         : uname,
          count        : count,
          countRank    : pl.countRank,
          scoreSum     : pl.scoreSum,
          scoreAverage : pl.scoreSum / count,
        };
      } );

  return GRofEachPlayer.sort( (a, b) => a.scoreAverage - b.scoreAverage );
};

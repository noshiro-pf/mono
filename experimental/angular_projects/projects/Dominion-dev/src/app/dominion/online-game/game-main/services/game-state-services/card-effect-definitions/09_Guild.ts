import { DataForCardEffect } from './data-for-card-effect';
import * as cs from './card-effect-shortcut';
import { DCard } from '../../../../types/dcard';


/* 231. パン屋 */
export const Baker = async ( thisDcard: DCard, pid: number,
  data: DataForCardEffect
) => {
  cs.incrementVcoin( pid, data );
  cs.goToDeterminatePhase( data );
};

/* 233. 蝋燭職人 */
export const Candlestick_Maker = async ( thisDcard: DCard, pid: number,
  data: DataForCardEffect
) => {
  cs.incrementVcoin( pid, data );
  cs.goToDeterminatePhase( data );
};




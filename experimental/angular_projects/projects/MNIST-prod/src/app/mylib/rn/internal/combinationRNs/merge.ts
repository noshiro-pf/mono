import { RN } from '../RN';
import { Unwrap, ArrayElement } from '../utils';



export function merge<T extends RN<any>[]>( ...srcs: T ): RN<ArrayElement<Unwrap<T>>> {
  return new MergeRN( ...srcs );
}



function getLatestCurr<T extends RN<[any, number]>[]>(
  rns: T
): ArrayElement<Unwrap<T>> {
  if ( !rns || !Array.isArray(rns) || rns.length === 0 ) {
    throw new Error('arg of getLatestCurr must be non-empty array');
  }
  return rns.reduce( (latest: ArrayElement<T>, rn: ArrayElement<T>) =>
            ( rn.value[1] > latest.value[1] ? rn : latest ) )
              .value[0];
}


class MergeRN<T extends RN<any>[]> extends RN<ArrayElement<Unwrap<T>>> {

  private srcsWithTimestamp: RN<any>[];

  constructor( ...srcs: T ) {
    if ( srcs.length === 0 ) {
      throw new Error('parents.length must be >= 1');
    }

    const srcsWithTimestamp: RN<any>[]
      = srcs.map( rn => rn.map( e => [e, Date.now()] ) );
    const latestCurr = getLatestCurr( srcsWithTimestamp );

    super( latestCurr, srcsWithTimestamp );

    this.srcsWithTimestamp = srcsWithTimestamp;
  }

  protected fire() {
    this.fireWith( getLatestCurr( this.srcsWithTimestamp ) );
  }
}

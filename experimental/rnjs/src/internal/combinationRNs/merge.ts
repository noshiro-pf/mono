import { RN } from '../RN';
import { ArrayElement, Unwrap } from '../utils';

export const merge = <T extends RN<any>[]>(
  ...srcs: T
): RN<ArrayElement<Unwrap<T>>> => new MergeRN(...srcs);

const getLatestCurr = <T extends RN<[any, number]>[]>(
  rns: T,
): ArrayElement<Unwrap<T>> => {
  if (!Array.isArray(rns) || rns.length === 0) {
    throw new Error('arg of getLatestCurr must be non-empty array');
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return rns.reduce((latest, rn) =>
    rn.value[1] > latest.value[1] ? rn : latest,
  ).value[0];
};

class MergeRN<T extends RN<any>[]> extends RN<ArrayElement<Unwrap<T>>> {
  private srcsWithTimestamp: RN<any>[];

  constructor(...srcs: T) {
    if (srcs.length === 0) {
      throw new Error('parents.length must be >= 1');
    }

    const srcsWithTimestamp: RN<any>[] = srcs.map((rn) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      rn.map((e) => [e, Date.now()]),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const latestCurr = getLatestCurr(srcsWithTimestamp);

    super(
      latestCurr,
      srcsWithTimestamp,
      `merge(${srcs.map((e) => e.name).join(',')})`,
    );

    this.srcsWithTimestamp = srcsWithTimestamp;
  }

  protected fire(): void {
    this.fireWith(getLatestCurr(this.srcsWithTimestamp));
  }
}

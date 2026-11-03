import { defineRoutes, search, type ParamCodec } from 'synstate-router';
import { Num, Optional, Result } from 'ts-data-forge';
import type * as t from 'ts-fortress';
import {
  BorrowingTotal,
  PercentFloat,
  repaymentTypes,
  Year,
} from '../types/index.mjs';

/**
 * A number of `type` in the query. `Num.safeParseFloat` refuses `''`, `'12px'`
 * and `'Infinity'`, which `Number` reads as `0`, `NaN` and `Infinity`; a value
 * that is refused, or that `type` does not accept, reads as absent.
 */
const numberOf = <A extends number>(type: t.Type<A>): ParamCodec<A> =>
  ({
    decode: (raw) => {
      const parsed = Num.safeParseFloat(raw);

      return Result.isOk(parsed) && type.is(parsed.value)
        ? Optional.some(parsed.value)
        : Optional.none;
    },
    encode: (value) => value.toString(),
  }) as const;

/**
 * The one page of the app. The inputs are its search parameters: the URL is the
 * one place they are kept (`loan-store.mts`). They have no `default`, so that
 * every one is written: a shared link keeps its meaning if a default changes.
 */
export const routes = defineRoutes({
  loan: {
    segment: '',
    search: {
      'repayment-type': search.literal(repaymentTypes),
      'borrowing-total': search.custom(numberOf(BorrowingTotal)),
      'borrowing-period': search.custom(numberOf(Year)),
      'interest-rate': search.custom(numberOf(PercentFloat)),
    },
  },
});

export type Routes = typeof routes;

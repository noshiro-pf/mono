import {
  createIYearMonthDate,
  IYearMonthDate,
} from '../../types/record/base/year-month-date';
import { IList } from '../../utils/immutable';
import { generateCalendar } from './generate-calendar';

test('generate-calendar', () => {
  /*
   * |Su|Mo|Tu|We|Th|Fr|Sa|
   * |--|--|--|--|--|--|--|
   * |28|29|30| 1| 2| 3| 4| --+
   * | 5| 6| 7| 8| 9|10|11|   |
   * |12|13|14|15|16|17|18|   | rowsize
   * |19|20|21|22|23|24|25|   |
   * |26|27|28|29|30|31| 1| --+
   */
  const year = 2020;
  const month = 7;
  expect(generateCalendar(year, month)).toEqual(
    IList<IList<IYearMonthDate>>([
      IList([
        createIYearMonthDate({ year: 2020, month: 6, date: 28 }),
        createIYearMonthDate({ year: 2020, month: 6, date: 29 }),
        createIYearMonthDate({ year: 2020, month: 6, date: 30 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 1 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 2 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 3 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 4 }),
      ]),
      IList([
        createIYearMonthDate({ year: 2020, month: 7, date: 5 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 6 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 7 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 8 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 9 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 10 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 11 }),
      ]),
      IList([
        createIYearMonthDate({ year: 2020, month: 7, date: 12 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 13 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 14 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 15 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 16 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 17 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 18 }),
      ]),
      IList([
        createIYearMonthDate({ year: 2020, month: 7, date: 19 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 20 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 21 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 22 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 23 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 24 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 25 }),
      ]),
      IList([
        createIYearMonthDate({ year: 2020, month: 7, date: 26 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 27 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 28 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 29 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 30 }),
        createIYearMonthDate({ year: 2020, month: 7, date: 31 }),
        createIYearMonthDate({ year: 2020, month: 8, date: 1 }),
      ]),
    ])
  );
});

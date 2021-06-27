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
  expect(generateCalendar(year, month)).toEqual([
    [
      { year: 2020, month: 6, date: 28 },
      { year: 2020, month: 6, date: 29 },
      { year: 2020, month: 6, date: 30 },
      { year: 2020, month: 7, date: 1 },
      { year: 2020, month: 7, date: 2 },
      { year: 2020, month: 7, date: 3 },
      { year: 2020, month: 7, date: 4 },
    ],
    [
      { year: 2020, month: 7, date: 5 },
      { year: 2020, month: 7, date: 6 },
      { year: 2020, month: 7, date: 7 },
      { year: 2020, month: 7, date: 8 },
      { year: 2020, month: 7, date: 9 },
      { year: 2020, month: 7, date: 10 },
      { year: 2020, month: 7, date: 11 },
    ],
    [
      { year: 2020, month: 7, date: 12 },
      { year: 2020, month: 7, date: 13 },
      { year: 2020, month: 7, date: 14 },
      { year: 2020, month: 7, date: 15 },
      { year: 2020, month: 7, date: 16 },
      { year: 2020, month: 7, date: 17 },
      { year: 2020, month: 7, date: 18 },
    ],
    [
      { year: 2020, month: 7, date: 19 },
      { year: 2020, month: 7, date: 20 },
      { year: 2020, month: 7, date: 21 },
      { year: 2020, month: 7, date: 22 },
      { year: 2020, month: 7, date: 23 },
      { year: 2020, month: 7, date: 24 },
      { year: 2020, month: 7, date: 25 },
    ],
    [
      { year: 2020, month: 7, date: 26 },
      { year: 2020, month: 7, date: 27 },
      { year: 2020, month: 7, date: 28 },
      { year: 2020, month: 7, date: 29 },
      { year: 2020, month: 7, date: 30 },
      { year: 2020, month: 7, date: 31 },
      { year: 2020, month: 8, date: 1 },
    ],
  ]);
});

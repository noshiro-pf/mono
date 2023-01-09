import { DateUtils } from './date-utils';

describe('DateUtils', () => {
  describe('getDay', () => {
    test('getDay(2019/12/25)', () => {
      expect(DateUtils.getLocaleDayOfWeek(DateUtils.from('2019/12/22'))).toBe(
        0
      );
      expect(DateUtils.getLocaleDayOfWeek(DateUtils.from('2019/12/23'))).toBe(
        1
      );
      expect(DateUtils.getLocaleDayOfWeek(DateUtils.from('2019/12/24'))).toBe(
        2
      );
      expect(DateUtils.getLocaleDayOfWeek(DateUtils.from('2019/12/25'))).toBe(
        3
      );
      expect(DateUtils.getLocaleDayOfWeek(DateUtils.from('2019/12/26'))).toBe(
        4
      );
      expect(DateUtils.getLocaleDayOfWeek(DateUtils.from('2019/12/27'))).toBe(
        5
      );
      expect(DateUtils.getLocaleDayOfWeek(DateUtils.from('2019/12/28'))).toBe(
        6
      );
    });
  });

  describe('setYear', () => {
    const date_20191225 = DateUtils.from('2019/12/25');

    test('setYear(2019/12/25, 2018)', () => {
      const result = DateUtils.setLocaleYear(2018)(date_20191225);

      expect(DateUtils.getLocaleYear(result)).toBe(2018);
      expect(DateUtils.getLocaleMonth(result)).toBe(12);
      expect(DateUtils.getLocaleDate(result)).toBe(25);
    });
  });

  describe('setMonth', () => {
    const date_20191225 = DateUtils.from('2019/12/25');

    test('setMonth(2019/12/25, 11)', () => {
      const result = DateUtils.setLocaleMonth(6)(date_20191225);

      expect(DateUtils.getLocaleYear(result)).toBe(2019);
      expect(DateUtils.getLocaleMonth(result)).toBe(6);
      expect(DateUtils.getLocaleDate(result)).toBe(25);
    });
  });

  describe('setDate', () => {
    const date_20191225 = DateUtils.from('2019/12/25');

    test('setDate(2019/12/25, 23)', () => {
      const result = DateUtils.setLocaleDate(23)(date_20191225);

      expect(DateUtils.getLocaleYear(result)).toBe(2019);
      expect(DateUtils.getLocaleMonth(result)).toBe(12);
      expect(DateUtils.getLocaleDate(result)).toBe(23);
    });
  });

  describe('setHours', () => {
    const date_20191225_235959 = DateUtils.from('2019/12/25 23:59:59');

    test('setHours(2019/12/25 23:59:59, 1)', () => {
      const result = DateUtils.setLocaleHours(1)(date_20191225_235959);

      expect(DateUtils.getLocaleHours(result)).toBe(1);
      expect(DateUtils.getLocaleMinutes(result)).toBe(59);
      expect(DateUtils.getLocaleSeconds(result)).toBe(59);
    });
  });

  describe('setMinutes', () => {
    const date_20191225_235959 = DateUtils.from('2019/12/25 23:59:59');

    test('setMinutes(2019/12/25 23:59:59, 1)', () => {
      const result = DateUtils.setLocaleMinutes(1)(date_20191225_235959);

      expect(DateUtils.getLocaleHours(result)).toBe(23);
      expect(DateUtils.getLocaleMinutes(result)).toBe(1);
      expect(DateUtils.getLocaleSeconds(result)).toBe(59);
    });
  });

  describe('setSeconds', () => {
    const date_20191225_235959 = DateUtils.from('2019/12/25 23:59:59');

    test('setSeconds(2019/12/25 23:59, 1)', () => {
      const result = DateUtils.setLocaleSeconds(1)(date_20191225_235959);

      expect(DateUtils.getLocaleHours(result)).toBe(23);
      expect(DateUtils.getLocaleMinutes(result)).toBe(59);
      expect(DateUtils.getLocaleSeconds(result)).toBe(1);
    });
  });

  describe('getLocaleYesterday', () => {
    test('case 1', () => {
      expect(
        DateUtils.getLocaleYesterday(DateUtils.from('2020/01/02'))
      ).toStrictEqual(DateUtils.from('2020/01/01'));
    });

    test('case 2', () => {
      expect(
        DateUtils.getLocaleYesterday(DateUtils.from('2021/01/01'))
      ).toStrictEqual(DateUtils.from('2020/12/31'));
    });
  });

  describe('getLocaleTomorrow', () => {
    test('case 1', () => {
      expect(
        DateUtils.getLocaleTomorrow(DateUtils.from('2020/01/01'))
      ).toStrictEqual(DateUtils.from('2020/01/02'));
    });

    test('case 2', () => {
      expect(
        DateUtils.getLocaleTomorrow(DateUtils.from('2020/12/31'))
      ).toStrictEqual(DateUtils.from('2021/01/01'));
    });
  });

  describe('toMidnight', () => {
    test('case 1', () => {
      expect(
        DateUtils.toMidnight(DateUtils.from('2020/1/1 12:34:56'))
      ).toStrictEqual(DateUtils.from('2020/1/1 00:00:00'));
    });
  });

  describe('cmp', () => {
    test('case 1', () => {
      expect(
        DateUtils.cmp(DateUtils.from('2020/1/1'), DateUtils.from('2020/1/2'))
      ).toBe(-1);
    });

    test('case 2', () => {
      expect(
        DateUtils.cmp(DateUtils.from('2020/1/1'), DateUtils.from('2020/1/1'))
      ).toBe(0);
    });

    test('case 3', () => {
      expect(
        DateUtils.cmp(DateUtils.from('2020/1/2'), DateUtils.from('2020/1/1'))
      ).toBe(1);
    });

    test('case 4', () => {
      expect(
        DateUtils.cmp(
          DateUtils.from('2020/1/1 00:00:00'),
          DateUtils.from('2020/1/1 00:00:01')
        )
      ).toBe(-1);
    });
  });

  describe('weekNumberLocale', () => {
    test('case 1', () => {
      expect(DateUtils.weekNumberLocale(DateUtils.from('2020/01/01'))).toBe(0);
    });

    test('case 2', () => {
      expect(DateUtils.weekNumberLocale(DateUtils.from('2020/09/22'))).toBe(3);
    });

    test('case 3', () => {
      expect(DateUtils.weekNumberLocale(DateUtils.from('2020/09/26'))).toBe(3);
    });

    test('case 4', () => {
      expect(DateUtils.weekNumberLocale(DateUtils.from('2020/09/27'))).toBe(4);
    });
  });

  describe('getLastDateNumberOfMonth', () => {
    test('case 1', () => {
      expect(DateUtils.getLastDateNumberOfMonth(2020, 1)).toBe(31);
    });

    test('case 2', () => {
      expect(DateUtils.getLastDateNumberOfMonth(2020, 2)).toBe(29);
    });

    test('case 3', () => {
      expect(DateUtils.getLastDateNumberOfMonth(2020, 4)).toBe(30);
    });
  });

  describe('getAllDatesOfMonth', () => {
    test('case 1', () => {
      expect(DateUtils.getAllDatesOfMonth(2020, 1)).toStrictEqual([
        DateUtils.from('2020/1/1'),
        DateUtils.from('2020/1/2'),
        DateUtils.from('2020/1/3'),
        DateUtils.from('2020/1/4'),
        DateUtils.from('2020/1/5'),
        DateUtils.from('2020/1/6'),
        DateUtils.from('2020/1/7'),
        DateUtils.from('2020/1/8'),
        DateUtils.from('2020/1/9'),
        DateUtils.from('2020/1/10'),
        DateUtils.from('2020/1/11'),
        DateUtils.from('2020/1/12'),
        DateUtils.from('2020/1/13'),
        DateUtils.from('2020/1/14'),
        DateUtils.from('2020/1/15'),
        DateUtils.from('2020/1/16'),
        DateUtils.from('2020/1/17'),
        DateUtils.from('2020/1/18'),
        DateUtils.from('2020/1/19'),
        DateUtils.from('2020/1/20'),
        DateUtils.from('2020/1/21'),
        DateUtils.from('2020/1/22'),
        DateUtils.from('2020/1/23'),
        DateUtils.from('2020/1/24'),
        DateUtils.from('2020/1/25'),
        DateUtils.from('2020/1/26'),
        DateUtils.from('2020/1/27'),
        DateUtils.from('2020/1/28'),
        DateUtils.from('2020/1/29'),
        DateUtils.from('2020/1/30'),
        DateUtils.from('2020/1/31'),
      ]);
    });
  });

  describe('numWeeksOfMonth', () => {
    test('case 1', () => {
      expect(DateUtils.numWeeksOfMonth(2020, 1)).toBe(5);
    });

    test('case 2', () => {
      expect(DateUtils.numWeeksOfMonth(2020, 2)).toBe(5);
    });

    test('case 3', () => {
      expect(DateUtils.numWeeksOfMonth(2015, 2)).toBe(4);
    });

    test('case 4', () => {
      expect(DateUtils.numWeeksOfMonth(2015, 5)).toBe(6);
    });
  });

  describe('toLocaleYMD', () => {
    test('case 1', () => {
      expect(DateUtils.toLocaleYMD(DateUtils.from('2020/1/1'), '/')).toBe(
        '2020/01/01'
      );
    });

    test('case 2', () => {
      expect(DateUtils.toLocaleYMD(DateUtils.from('2020/1/1'), '-')).toBe(
        '2020-01-01'
      );
    });
  });

  describe('toLocaleHM', () => {
    test('case 1', () => {
      expect(
        DateUtils.toLocaleHM(DateUtils.from('2020/1/1 12:34:56'), ':')
      ).toBe('12:34');
    });

    test('case 2', () => {
      expect(
        DateUtils.toLocaleHM(DateUtils.from('2020/1/1 12:34:56'), '.')
      ).toBe('12.34');
    });
  });

  describe('toLocaleHMS', () => {
    test('case 1', () => {
      expect(
        DateUtils.toLocaleHMS(DateUtils.from('2020/1/1 12:34:56'), ':')
      ).toBe('12:34:56');
    });

    test('case 2', () => {
      expect(
        DateUtils.toLocaleHMS(DateUtils.from('2020/1/1 12:34:56'), '.')
      ).toBe('12.34.56');
    });
  });

  describe('toLocaleYMDHMS', () => {
    test('case 1', () => {
      expect(
        DateUtils.toLocaleYMDHMS(DateUtils.from('2020/1/1 12:34:56'), '/', ':')
      ).toBe('2020/01/01 12:34:56');
    });

    test('case 2', () => {
      expect(
        DateUtils.toLocaleYMDHMS(DateUtils.from('2020/1/1 12:34:56'), '@', '*')
      ).toBe('2020@01@01 12*34*56');
    });
  });
});

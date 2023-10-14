export class Stopwatch {
  private _startTime = 0;
  private _endTime = 0;
  private _result = 0;
  private _name = '';

  constructor(name = '') {
    this._name = name;
  }

  start(log = false) {
    this._startTime = new Date().getTime();
    this._result = 0;
    if (log) console.log(`${this._name} started.`);
  }

  stop(log = false) {
    this._endTime = new Date().getTime();
    this._result = this._endTime - this._startTime;
    if (log) console.log(`${this._name} stopped.`);
  }

  result() {
    return this._result;
  }

  printResult() {
    console.log(`${this._name} ${this._result} msec`);
  }
}

/* functions */

export const utils = {
  localStorage: {
    set: (key: string, value: any) =>
      localStorage.setItem(key, JSON.stringify(value)),

    get: (key: string) => JSON.parse(localStorage.getItem(key) || ''),

    has: (key: string): boolean => localStorage.getItem(key) != null,
  },

  string: {
    submatch: (
      target: string,
      key: string,
      ignoreCase: boolean = false,
    ): boolean =>
      ignoreCase
        ? utils.string.submatch(target.toUpperCase(), key.toUpperCase())
        : target.indexOf(key) !== -1,

    getAlphabets: (charCase: 'upper' | 'lower') => {
      const code_a = 'a'.charCodeAt(0);
      const code_A = 'A'.charCodeAt(0);
      const code = charCase === 'upper' ? code_A : code_a;
      return utils.number.seq0(26).map((i) => String.fromCharCode(code + i));
    },
  },

  object: {
    keysAsNumber: (obj: object): number[] =>
      Object.keys(obj || {}).map((e) => Number(e)),

    forEach: (
      obj: { [key: string]: any },
      f: (element: any, key: string, obj: object) => any,
    ) => Object.keys(obj || {}).forEach((key) => f(obj[key], key, obj)),

    map: (
      obj: { [key: string]: any },
      f: (element: any, key: string, object: object) => any,
    ) => Object.keys(obj || {}).map((key) => f(obj[key], key, obj)),

    values: (obj: { [key: string]: any }) =>
      Object.keys(obj).map((key) => obj[key]),

    entries: (obj: object) =>
      utils.object.map(obj, (el, key) => ({ key: key, value: el })),

    copy: (obj: object) => JSON.parse(JSON.stringify(obj || {})),
    serialize: (obj: object) => JSON.parse(JSON.stringify(obj || {})),

    compareByJsonString: (obj1: object, obj2: object) =>
      JSON.stringify(obj1) === JSON.stringify(obj2),

    shallowCopy: (obj: object, asArray?: boolean) =>
      asArray ? Object.assign([], obj) : Object.assign({}, obj),
  },

  array: {
    new: <T>(size: number, initValue: T): T[] =>
      Array.from(new Array(size)).map((_) => initValue),

    new2: <T>(size: number, initializer: (v: any) => T): T[] =>
      Array.from(new Array(size)).map(initializer),

    isEmpty: (ar: any[]): boolean => ar.length === 0,
    back: <T>(ar: T[]): T => ar[ar.length - 1],
    front: <T>(ar: T[]): T => ar[0],

    isEqual: <T>(ar1: T[], ar2: T[]): boolean => {
      if (ar1.length !== ar2.length) return false;
      for (let i = 0; i < ar1.length; ++i) {
        if (ar1[i] !== ar2[i]) return false;
      }
      return true;
    },

    pushValues: <T>(target: T[], values: T[]): T[] => {
      Array.prototype.push.apply(target, values);
      return target;
    },

    /**
     * @description alias of `ar.splice( index, 1 )[0]`;  Delete the element at address `index`
     * @return the deleted element
     */
    removeAt: <T>(arr: T[], index: number): T | undefined =>
      index < 0 ? undefined : arr.splice(index, 1)[0],

    removeIf: <T>(arr: T[], f: (value: T) => boolean): T | undefined =>
      utils.array.removeAt(arr, arr.findIndex(f)),

    remove: <T>(arr: T[], value: T): T | undefined =>
      utils.array.removeIf(arr, (e) => e === value),

    removeValue: <T>(arr: T[], value: T): T | undefined =>
      utils.array.removeIf(arr, (e) => e === value),

    getRemovedCopy: <T>(arr: T[], target: T): T[] =>
      arr.filter((e) => e !== target),

    filterRemove: <T>(arr: T[], f: (value: T) => boolean): [T[], T[]] => [
      arr.filter(f),
      arr.filter((e) => !f(e)),
    ],

    getCombined: (arr1: any[], arr2: any[]): any[] => [...arr1, ...arr2],

    copy: <T>(arr: T[]): T[] => [...arr],

    getReversed: (arr: any[]) => utils.array.copy(arr).reverse(),

    getSortedByKey: (arr: any[], key: string) =>
      utils.array.copy(arr).sort((x, y) => x[key] - y[key]),

    /**
     * @desc copy and return unique array
     * @param arr target array
     * @param mapFn perform identity check after mapping by the map function
     */
    uniq: <T>(arr: T[], mapFn?: (value: T) => any) => {
      if (!mapFn) {
        return Array.from(new Set(arr));
      } else {
        const mappedValues = new Set();
        return arr.filter((val) => {
          const mappedValue = mapFn(val);
          if (mappedValues.has(mappedValue)) return false;
          mappedValues.add(mappedValue);
          return true;
        });
      }
    },

    sortNumeric: (arr: any[]): any[] =>
      arr.sort((a, b) => parseFloat(a) - parseFloat(b)),

    sum: (arr: number[]): number => arr.reduce((prev, curr) => prev + curr),

    average: (arr: number[]): number =>
      utils.array.isEmpty(arr) ? 0 : utils.array.sum(arr) / arr.length,

    swap: (arr: any[], index1: number, index2: number) => {
      [arr[index1], arr[index2]] = [arr[index2], arr[index2]];
    },

    isSubset: <T>(arr1: T[], arr2: T[]): boolean =>
      arr1.every((e) => arr2.includes(e)),

    setIntersection: <T>(arr1: T[], arr2: T[]): T[] =>
      arr1.filter((e) => arr2.includes(e)),

    setDifference(sortedArray1: number[], sortedArray2: number[]): number[] {
      const result: number[] = [];
      let it1 = 0; // iterator for sortedArray1
      let it2 = 0; // iterator for sortedArray2
      let val1 = sortedArray1[it1];
      let val2 = sortedArray2[it2];
      while (it1 < sortedArray1.length && it2 < sortedArray2.length) {
        if (val1 === val2) {
          val1 = sortedArray1[++it1];
          val2 = sortedArray2[++it2];
        } else if (val1 < val2) {
          result.push(val1);
          val1 = sortedArray1[++it1];
        } else {
          val2 = sortedArray2[++it2];
        }
      }
      for (; it1 < sortedArray1.length; ++it1) {
        result.push(sortedArray1[it1]);
      }
      return result;
    },

    minValue: (arr: number[]): number => {
      let min = Infinity;
      const QUANTUM = 32768;

      for (let i = 0; i < arr.length; i += QUANTUM) {
        const submin = Math.min(
          ...arr.slice(i, Math.min(i + QUANTUM, arr.length)),
        );
        min = Math.min(submin, min);
      }
      return min;
    },

    maxValue: (arr: number[]): number => {
      let max = -Infinity;
      const QUANTUM = 32768;

      for (let i = 0; i < arr.length; i += QUANTUM) {
        const submax = Math.max.apply(
          null,
          arr.slice(i, Math.max(i + QUANTUM, arr.length)),
        );
        max = Math.max(submax, max);
      }
      return max;
    },

    isInArrayRange: (index: number, arr: any[]): boolean =>
      utils.number.isInRange(index, 0, arr.length),

    expandAndCombine: <T>(array2d: T[][]): T[] =>
      array2d.reduce((prev, curr) => utils.array.getCombined(prev, curr), []),

    flatten: <T>(array2d: T[][]): T[] => utils.array.expandAndCombine(array2d),
  },

  number: {
    /**
     * @description (0, 5) => [0,1,2,3,4], (2,12,3) => [2,5,8,11]
     * @param start start number
     * @param length array length
     * @param step step number (default = 1)
     * @return the number sequence array
     */
    numberSequence: (
      start: number,
      length: number,
      step: number = 1,
    ): number[] =>
      Array.from(new Array(length)).map((_, i) => i * step + start),

    numSeq: (start: number, length: number, step: number = 1): number[] =>
      utils.number.numberSequence(start, length, step),

    seq0: (length: number, step: number = 1): number[] =>
      utils.number.numberSequence(0, length, step),

    roundAt: (val: number, precision: number) => {
      const digit = 10 ** precision;
      return Math.round(val * digit) / digit;
    },

    integerDivision: (a: number, b: number): number =>
      Math.floor(Math.floor(a) / Math.floor(b)),

    divint: (a: number, b: number) => utils.number.integerDivision(a, b),

    /**
     * @desc isInRange( target, begin, end ) === ( begin <= target && target < end )
     */
    isInRange: (target: number, begin: number, end: number): boolean =>
      begin <= target && target < end,

    isInt: (value: number): boolean => Math.round(value) === value,

    cmp: (a: number, b: number): number => a - b,
    cmpR: (a: number, b: number): number => b - a,

    random: {
      genIntegerIn: (min: number, max: number) =>
        Math.round(Math.random() * (max - min) + min),

      getRandomElement: <T>(array: T[]): T =>
        array[utils.number.random.genIntegerIn(0, array.length - 1)],

      getShuffled: <T>(arr: T[]): T[] =>
        arr
          .map<[T, number]>((e) => [e, Math.random()])
          .sort((x, y) => x[1] - y[1])
          .map<T>((pair) => pair[0]),

      shuffle: (arr: any[]) => {
        const shuffled = utils.number.random.getShuffled(arr);
        shuffled.forEach((v, i) => (arr[i] = v));
      },

      permutation: (n: number): number[] =>
        utils.number.random.getShuffled(utils.number.seq0(n)),

      /**
       * @description Box-Muller法
       * @param m 平均（デフォルト = 0.0）
       * @param v 標準偏差（デフォルト = 1.0）
       */
      randn: (m = 0.0, v = 1.0): number => {
        const a = 1 - Math.random();
        const b = 1 - Math.random();
        const c = Math.sqrt(-2 * Math.log(a));
        if (0.5 - Math.random() > 0) {
          return c * Math.sin(Math.PI * 2 * b) * v + m;
        } else {
          return c * Math.cos(Math.PI * 2 * b) * v + m;
        }
      },
    },
  },

  matrix: {
    new: <T>(rowSize: number, colSize: number, initValue: T): T[][] =>
      utils.array.new2(rowSize, () => utils.array.new(colSize, initValue)),
  },

  date: {
    /**
     * @description 何週目か(0-origin)を返す
     */
    weekNumber: (date: Date | number): number => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      const date0Saturday = dt.getDate() - 1 + (6 - dt.getDay()); // 同じ週の土曜日
      return Math.floor(date0Saturday / 7);
    },

    /**
     * @description 引数の日が含まれる月の最終日(28-31)の数値を返す
     */
    getLastDateNumberOfMonth: (date: Date | number): number => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      return new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
    },

    nofWeeks: (date: Date | number): number => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      const lastDateNumber = utils.date.getLastDateNumberOfMonth(dt);
      const lastDate: Date = new Date(dt);
      lastDate.setDate(lastDateNumber);
      return utils.date.weekNumber(lastDate) + 1;
    },

    isToday: (date: Date | number): boolean => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      // Get today's date
      const today = new Date();
      // call setHours to take the time out of the comparison
      return dt.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
    },

    getAllDatesIn: (year: number, month: number): Date[] => {
      const firstDateOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
      return utils.number
        .numSeq(1, utils.date.getLastDateNumberOfMonth(firstDateOfMonth))
        .map((date) => new Date(year, month, date, 0, 0, 0, 0));
    },

    getAllDatesInTimestamp: (year: number, month: number): number[] =>
      utils.date.getAllDatesIn(year, month).map((dt) => dt.getTime()),

    /**
     * date1  <  date2 --> -1
     * date1  >  date2 -->  1
     * date1 === date2 -->  0
     */
    compare: (date1: Date | number, date2: Date | number): -1 | 0 | 1 => {
      const date1value = typeof date1 === 'number' ? date1 : date1.getTime();
      const date2value = typeof date2 === 'number' ? date2 : date2.getTime();
      if (date1value < date2value) return -1;
      if (date1value > date2value) return 1;
      return 0;
    },

    getDayStringJp: (date: Date | number): string => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      return ['日', '月', '火', '水', '木', '金', '土'][dt.getDay()];
    },

    getDayStringEng: (date: Date | number): string => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][dt.getDay()];
    },

    toYMD: (date: Date | number, delimiter: string = '/'): string => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      return (
        dt.getFullYear() +
        delimiter +
        (dt.getMonth() + 1).toString().padStart(2, '0') +
        delimiter +
        dt.getDate().toString().padStart(2, '0')
      );
    },

    toHM: (date: Date | number, delimiter: string = ':'): string => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      return (
        dt.getHours().toString().padStart(2, '0') +
        delimiter +
        dt.getMinutes().toString().padStart(2, '0')
      );
    },

    toHMS: (date: Date | number, delimiter: string = ':'): string => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      return (
        dt.getHours().toString().padStart(2, '0') +
        delimiter +
        dt.getMinutes().toString().padStart(2, '0') +
        delimiter +
        dt.getSeconds().toString().padStart(2, '0')
      );
    },

    toYMDHMS: (date: Date | number): string =>
      `${utils.date.toYMD(date)} ${utils.date.toHMS(date)}`,

    getYestereday: (date: Date | number): Date => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      return new Date(new Date(dt).setDate(dt.getDate() - 1));
    },

    getYesteredayTimestamp: (date: Date | number): number =>
      utils.date.getYestereday(date).getTime(),

    getTomorrow: (date: Date | number): Date => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      return new Date(new Date(dt).setDate(dt.getDate() + 1));
    },

    getTomorrowTimestamp: (date: Date | number): number =>
      utils.date.getTomorrow(date).getTime(),

    toMidnight: (date: Date | number): Date => {
      const dt = typeof date === 'number' ? new Date(date) : date;
      const midnight = new Date(dt);
      midnight.setHours(0);
      midnight.setMinutes(0);
      midnight.setSeconds(0);
      midnight.setMilliseconds(0);
      return midnight;
    },

    toMidnightTimestamp: (date: Date | number): number =>
      utils.date.toMidnight(date).getTime(),
  },

  asyncOperation: {
    sleep: (sec: number): Promise<any> =>
      new Promise((resolve) => setTimeout(resolve, sec * 1000)),

    asyncFilter: async (array: any[], asyncFn: Function) => {
      const result = await Promise.all(array.map((e) => asyncFn(e)));
      return array.filter((_, i) => result[i]);
    },
  },
};

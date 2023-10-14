// utils

export const isInt = (value: number): boolean => Math.round(value) === value;

export const roundAt = (val: number, precision: number) => {
  const digit = 10 ** precision;
  return Math.round(val * digit) / digit;
};

export const randn = (m = 0.0, v = 1.0): number => {
  const a = 1 - Math.random();
  const b = 1 - Math.random();
  const c = Math.sqrt(-2 * Math.log(a));
  if (0.5 - Math.random() > 0) {
    return c * Math.sin(Math.PI * 2 * b) * v + m;
  } else {
    return c * Math.cos(Math.PI * 2 * b) * v + m;
  }
};

/**
 * type definition
 * usage: const x: NdArray = [1, 2, [3, [4, [5, [6, [7, [8]]]]]]];
 */

export type TNdNum = number | INdArray;
interface INdArray extends Array<TNdNum> {
  [key: number]: TNdNum;
}

// methods

export const newArray = <T>(length: number, initialValue: T): T[] =>
  Array.apply(null, Array(length)).fill(initialValue);

export const seq = (length: number, begin = 0, step = 1): number[] =>
  newArray(length, 0).map((_, i) => i * step + begin);

export const arange = seq;

export const createNdArray = (
  shape: number[],
  initialValue: number = 0,
): TNdNum => {
  if (!shape || shape.length < 1) return initialValue;
  const array1 = newArray(shape[0], 0);
  if (shape.length === 1) {
    return array1.map((_) => initialValue);
  } else {
    return array1.map((_) => createNdArray(shape.slice(1), initialValue));
  }
};

const deepCopy_s = (d: number, x: TNdNum): TNdNum => {
  if (typeof x === 'number') return x;
  if (d === 1) {
    return (x as number[]).slice();
  } else {
    return x.map((line) => deepCopy_s(d - 1, line));
  }
};

export const deepCopy = (x: TNdNum): TNdNum => deepCopy_s(dim(x), x);

export const dim = (x: TNdNum): number => {
  if (!x || typeof x === 'number') {
    return 0;
  } else {
    return 1 + dim(x[0]);
  }
};

const shapeOf_s = (acc: number[], x: TNdNum): void => {
  if (!x || typeof x === 'number') {
    return;
  } else {
    acc.push(x.length);
    shapeOf_s(acc, x[0]);
  }
};

export const shapeOf = (x: TNdNum): number[] => {
  const acc: number[] = [];
  shapeOf_s(acc, x);
  return acc;
};

export const isSameShape = (x: TNdNum, y: TNdNum): boolean => {
  const xShape = shapeOf(x);
  const yShape = shapeOf(y);
  if (xShape.length !== yShape.length) return false;
  return xShape.every((e, i) => e === yShape[i]);
};

export const nofElements = (x: TNdNum): number =>
  shapeOf(x).reduce((a, b) => a * b, 1);

const at_s = (d: number, x: TNdNum, pos: number[]): number => {
  if (typeof x === 'number') return x;
  if (d !== pos.length) {
    throw new Error('dim(x) and pos.length does not match');
  }
  return at_s(d - 1, x[pos[0]], pos.slice(1));
};

export const at = (x: TNdNum, pos: number[]): number => at_s(dim(x), x, pos);

const set_s = (d: number, x: TNdNum, pos: number[], value: number): void => {
  if (!x || typeof x === 'number') return;
  if (d === 1) {
    x[pos[0]] = value;
  } else {
    set_s(d - 1, x[pos[0]], pos.slice(1), value);
  }
};

export const set = (x: TNdNum, pos: number[], value: number): void => {
  set_s(dim(x), x, pos, value);
};

const map_s = (d: number, x: TNdNum, f: (e: number) => number): TNdNum => {
  if (typeof x === 'number') return f(x);
  if (d === 1) {
    return (x as number[]).map((e) => f(e));
  } else {
    return x.map((line) => map_s(d - 1, line, f));
  }
};

export const map = (x: TNdNum, f: (e: number) => number): TNdNum =>
  map_s(dim(x), x, f);

const updateValue_s = (
  d: number,
  x: TNdNum,
  f: (e: number) => number,
): void => {
  if (typeof x === 'number') return;
  if (d === 1) {
    (x as number[]).forEach((e, i) => (x[i] = f(e)));
  } else {
    x.map((line) => updateValue_s(d - 1, line, f));
  }
};

export const updateValue = (x: TNdNum, f: (e: number) => number): void => {
  updateValue_s(dim(x), x, f);
};

const flatten_s = (d: number, x: TNdNum, acc: number[]): void => {
  if (typeof x === 'number') {
    acc.push(x);
  } else if (d === 1) {
    Array.prototype.push.apply(acc, x);
  } else {
    x.forEach((e) => flatten_s(d - 1, e, acc));
  }
};

export const flatten = (x: TNdNum): number[] => {
  const acc: number[] = [];
  flatten_s(dim(x), x, acc);
  return acc;
};

const reshape_s = (
  from: number[],
  begin: number,
  end: number,
  shape: number[],
  shapeIdx: number,
): TNdNum => {
  if (shapeIdx > shape.length - 1) {
    throw new Error('shapeIdx should be in shape index range');
  }
  if (shapeIdx === shape.length - 1) {
    // dim === 1
    return from.slice(begin, end);
  } else {
    const l = shape[shapeIdx];
    const chunkSize = (end - begin) / l;
    return seq(l).map((i) =>
      reshape_s(
        from,
        begin + chunkSize * i,
        begin + chunkSize * (i + 1),
        shape,
        shapeIdx + 1,
      ),
    );
  }
};

export const reshape = (x: TNdNum, shape: number[]): TNdNum => {
  if (typeof x === 'number') return x;

  const x_1d = flatten(x);
  const shape_full = shape.slice();

  const blankIndex = shape_full.findIndex((e) => e === -1);
  if (blankIndex !== -1) {
    shape_full[blankIndex] =
      nofElements(x) /
      shape_full.filter((e) => e !== -1).reduce((a, v) => a * v, 1);
    if (!isInt(shape_full[blankIndex])) {
      throw new Error('invalid value in shape (must be integer)');
    }
  }
  return reshape_s(x_1d, 0, x_1d.length, shape_full, 0);
};

const slice_s = (
  d: number,
  x: TNdNum,
  range: {
    begin?: number;
    end?: number;
    stride?: number;
  }[],
): TNdNum => {
  if (typeof x === 'number') return x;
  if (d !== range.length) {
    throw new Error('range length does not match');
  }

  const range0_cmpl = {
    begin: range[0].begin || 0,
    end: range[0].end || undefined,
    stride: range[0].stride || 1,
  };

  if (d === 1) {
    return x
      .slice(range0_cmpl.begin, range0_cmpl.end)
      .filter((_, i) => i % range0_cmpl.stride === 0);
  } else {
    return x
      .slice(range0_cmpl.begin, range0_cmpl.end)
      .filter((_, i) => i % range0_cmpl.stride === 0)
      .map((line) => slice_s(d - 1, line, range.slice(1)));
  }
};

export const slice = (
  x: TNdNum,
  range: {
    begin?: number;
    end?: number;
    stride?: number;
  }[],
): TNdNum => {
  return slice_s(dim(x), x, range);
};

const transpose_s = (
  from: TNdNum,
  d: number,
  to: TNdNum,
  tr: number[],
  pos: number[],
): void => {
  if (typeof from === 'number') return;
  if (d === 1) {
    (from as number[]).forEach((e: number, i) => {
      const pos2 = pos.concat([i]); // [...pos, i];
      set(
        to,
        tr.map((j) => pos2[j]),
        e,
      );
    });
  } else {
    from.forEach((_, i) => {
      transpose_s(from[i], d - 1, to, tr, pos.concat([i]) /* [...pos, i] */);
    });
  }
};

export const transpose = (x: TNdNum, tr: number[]) => {
  if (typeof x === 'number') return x;
  const d = dim(x);
  if (d !== tr.length) {
    throw new Error('dim(x) and tr.length does not match');
  }
  const result = zeros(tr.map((i) => shapeOf(x)[i]));
  transpose_s(x, d, result, tr, []);
  return result;
};

// 演算

export const zeros = (size: number[]): TNdNum => createNdArray(size, 0);
export const ones = (size: number[]): TNdNum => createNdArray(size, 1);

export const exp = (x: TNdNum): TNdNum => {
  if (typeof x === 'number') return Math.exp(x);
  return x.map((e) => exp(e));
};

const add_s = (d: number, x: TNdNum, y: TNdNum): TNdNum => {
  if (typeof x === 'number' || typeof y === 'number') {
    if (typeof x === 'number' && typeof y === 'number') {
      return x + y;
    } else {
      throw new Error('type does not match');
    }
  }
  if (d === 1) {
    return (x as number[]).map((e, i) => e + (y as number[])[i]);
  } else {
    return x.map((line, i) => add_s(d - 1, line, y[i]));
  }
};
export const add = (x: TNdNum, y: TNdNum): TNdNum => {
  if (!isSameShape(x, y)) throw new Error('shape does not match');
  return add_s(dim(x), x, y);
};

const sub_s = (d: number, x: TNdNum, y: TNdNum): TNdNum => {
  if (typeof x === 'number' || typeof y === 'number') {
    if (typeof x === 'number' && typeof y === 'number') {
      return x - y;
    } else {
      throw new Error('type does not match');
    }
  }
  if (d === 1) {
    return (x as number[]).map((e, i) => e - (y as number[])[i]);
  } else {
    return x.map((line, i) => sub_s(d - 1, line, y[i]));
  }
};
export const sub = (x: TNdNum, y: TNdNum): TNdNum => {
  if (!isSameShape(x, y)) throw new Error('shape does not match');
  return sub_s(dim(x), x, y);
};

const mul_s = (d: number, x: TNdNum, y: TNdNum): TNdNum => {
  if (typeof x === 'number' || typeof y === 'number') {
    if (typeof x === 'number' && typeof y === 'number') {
      return x * y;
    } else {
      throw new Error('type does not match');
    }
  }
  if (d === 1) {
    return (x as number[]).map((e, i) => e * (y as number[])[i]);
  } else {
    return x.map((line, i) => mul_s(d - 1, line, y[i]));
  }
};
export const mul = (x: TNdNum, y: TNdNum): TNdNum => {
  if (!isSameShape(x, y)) throw new Error('shape does not match');
  return mul_s(dim(x), x, y);
};

const div_s = (d: number, x: TNdNum, y: TNdNum): TNdNum => {
  if (typeof x === 'number' || typeof y === 'number') {
    if (typeof x === 'number' && typeof y === 'number') {
      return x / y;
    } else {
      throw new Error('type does not match');
    }
  }
  if (d === 1) {
    return (x as number[]).map((e, i) => e / (y as number[])[i]);
  } else {
    return x.map((line, i) => div_s(d - 1, line, y[i]));
  }
};
export const div = (x: TNdNum, y: TNdNum): TNdNum => {
  if (!isSameShape(x, y)) throw new Error('shape does not match');
  return div_s(dim(x), x, y);
};

const matrixProduct = (x: number[][], y: number[][]): number[][] => {
  const [shape_x0, shape_x1] = shapeOf(x);
  const [shape_y0, shape_y1] = shapeOf(y);
  const result = createNdArray([shape_x0, shape_y1], 0) as number[][];
  x.forEach((vx, ix) => {
    y.forEach((vy, iy) => {
      vy.forEach((e, j) => {
        result[ix][j] += vx[iy] * e;
      });
    });
  });
  return result;
};

export const dot = (x: TNdNum, y: TNdNum): TNdNum => {
  const dim_x = dim(x);
  const dim_y = dim(y);
  const [shape_x0, shape_x1] = shapeOf(x);
  const [shape_y0, shape_y1] = shapeOf(y);
  if (dim_x === 2 && dim_y === 2 && shape_x1 === shape_y0) {
    // matrix/matrix
    return matrixProduct(x as number[][], y as number[][]);
  } else if (dim_x === 1 && dim_y === 2 && shape_x0 === shape_y0) {
    // vector/matrix
    return matrixProduct([x as number[]], y as number[][])[0];
  } else if (dim_x === 2 && dim_y === 1 && shape_x1 === shape_y0) {
    // matrix/vector
    return matrixProduct(
      x as number[][],
      (y as number[]).map((e) => [e]),
    ).map((e) => e[0]);
  } else if (dim_x === 1 && dim_y === 1 && shape_x0 === shape_y0) {
    // vector/vector
    return matrixProduct(
      [x as number[]],
      (y as number[]).map((e) => [e]),
    )[0][0];
  } else {
    throw new Error('cannot compute the matrix product of given arrays');
  }
};

const shrinkToMaxValue = (d: number, x: TNdNum): TNdNum => {
  if (typeof x === 'number') return x;
  if (d === 1) {
    return Math.max.apply(null, x as number[]);
  } else {
    return x.map((e) => shrinkToMaxValue(d - 1, e));
  }
};

export const max = (x: TNdNum, axis?: number): number | TNdNum => {
  if (typeof x === 'number') return x;
  const d = dim(x);
  if (axis === undefined) {
    if (d === 1) return Math.max.apply(null, x as number[]);
    return Math.max.apply(null, x.map((e) => max(e)) as number[]);
  } else {
    // maxを取ってつぶしたい軸を末尾にずらしてmaxを取り元に戻す
    const tr = newArray(d, 0).map((_, i) => i);
    tr.splice(axis, 1); // [0, 1, 2] -> [1, 2]
    tr.push(axis); // [1, 2] -> [1, 2, 0]
    let result = transpose(x, tr);
    result = shrinkToMaxValue(d, result);
    return result;
  }
};

const shrinkToSum = (d: number, x: TNdNum): TNdNum => {
  if (typeof x === 'number') return x;
  if (d === 1) {
    return (x as number[]).reduce((a, b) => a + b, 0);
  } else {
    return x.map((e) => shrinkToSum(d - 1, e));
  }
};

export const sum = (x: TNdNum, axis?: number): number | TNdNum => {
  if (typeof x === 'number') return x;
  const d = dim(x);
  if (axis === undefined) {
    if (d === 1) return (x as number[]).reduce((a, b) => a + b, 0);
    return (x.map((e) => sum(e)) as number[]).reduce((a, b) => a + b, 0);
  } else {
    // sumを取ってつぶしたい軸を末尾にずらしてsumを取り元に戻す
    const tr = newArray(d, 0).map((_, i) => i);
    tr.splice(axis, 1); // [0, 1, 2] -> [1, 2]
    tr.push(axis); // [1, 2] -> [1, 2, 0]
    let result = transpose(x, tr);
    result = shrinkToSum(d, result);
    return result;
  }
};

export const random = {
  randn: (shape: number[]): TNdNum => {
    const result = createNdArray(shape);
    updateValue(result, () => randn());
    return result;
  },
};

export const round = (x: TNdNum, precision: number): TNdNum =>
  map(x, (e) => roundAt(e, precision));

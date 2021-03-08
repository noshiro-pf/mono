import * as np from './num';

{
  // newArray
  /* ToDo */
}
{
  // seq
  const a = np.seq(5, 1, 2);
  if (a[0] !== 1) throw new Error('seq');
  if (a[1] !== 3) throw new Error('seq');
  if (a[2] !== 5) throw new Error('seq');
  if (a[3] !== 7) throw new Error('seq');
  if (a[4] !== 9) throw new Error('seq');
}
{
  // createNdArray
  /* ToDo */
}
{
  // dim
  /* ToDo */
}
{
  // deepCopy
  /* ToDo */
}
{
  // shapeOf
  /* ToDo */
}
{
  // isSameShape
  const a = np.zeros([3, 4, 5]);
  const b = np.ones([3, 4, 5]);
  const c = np.ones([3, 4, 6]);
  if (!np.isSameShape(a, b)) throw new Error('isSameShape');
  if (np.isSameShape(a, c)) throw new Error('isSameShape');
}
{
  // nofElements
  if (np.nofElements(np.ones([2, 3, 4, 5])) !== 2 * 3 * 4 * 5) {
    throw new Error('nofElements');
  }
}
{
  // at
  /** a
   * [ [0, 1,  2,  3],
   *   [4, 5,  6,  7],
   *   [8, 9, 10, 11] ]
   */
  const a = np.reshape(np.seq(12), [3, 4]) as number[][];
  if (np.at(a, [1, 3]) !== 7) throw new Error('at');

  /** b
   * [[ [ 0,  1,  2,  3 ],
   *    [ 4,  5,  6,  7 ],
   *    [ 8,  9, 10, 11 ] ],
   *  [ [12, 13, 14, 15 ],
   *    [16, 17, 18, 19 ],
   *    [20, 21, 22, 23 ] ] ],
   */
  const b = np.reshape(np.seq(24), [2, 3, 4]) as number[][][];
  if (np.at(b, [1, 1, 1]) !== 17) throw new Error('at');

  /** c
   * [[ [ 0,  1,  2,  3 ],
   *    [ 4,  5,  6,  7 ],
   *    [ 8,  9, 10, 11 ] ],
   *  [ [12, 13, 14, 15 ],
   *    [16, 17, 18, 19 ],
   *    [20, 21, 22, 23 ] ] ],
   */
  const c = np.reshape(np.seq(24), [2, -1, 4]) as number[][][];
  if (np.at(c, [1, 1, 1]) !== 17) throw new Error('at');
}
{
  // set
  /** a
   * [ [0, 1,  2,  3],
   *   [4, 5,  6,  7],
   *   [8, 9, 10, 11] ]
   */
  const a = np.reshape(np.seq(12), [3, 4]) as number[][];
  np.set(a, [2, 1], -1);
  if (a[2][1] !== -1) throw new Error('set');
}
{
  // map
  const a = np.reshape(np.seq(12), [3, 4]) as number[][];

  /** b
   * [ [ 0,  2,  4,  6],
   *   [ 8, 10, 12, 14],
   *   [16, 18, 20, 22] ]
   */
  const b = np.map(a, (x) => 2 * x) as number[][];
  if (b[2][1] !== 18) throw new Error('map');
}
{
  // apply
  const a = np.reshape(np.seq(12), [3, 4]) as number[][];

  /** a
   * [ [1,  2,  3,  4],
   *   [5,  6,  8,  8],
   *   [9, 10, 11, 12] ]
   */
  np.updateValue(a, (x) => x + 1);
  if (a[2][1] !== 10) throw new Error('apply');
}
{
  // flatten
  const f = np.flatten(np.ones([2, 3, 4]));
  if (f.length !== 2 * 3 * 4) throw new Error('flatten');
  if (f[2 * 3 * 4 - 1] !== 1) throw new Error('flatten');
}
{
  // reshape
  const a = np.reshape(np.ones([3, 4, 2]), [4, 6]) as number[][];
  if (a.length !== 4) throw new Error('reshape');
  if (a[0].length !== 6) throw new Error('reshape');
  if (a[3][5] !== 1) throw new Error('reshape');
  /** b
   * [ [0, 1,  2,  3],
   *   [4, 5,  6,  7],
   *   [8, 9, 10, 11] ]
   */
  const b = np.reshape(np.seq(12), [3, 4]) as number[][];
  if (b[1][1] !== 5) throw new Error('reshape');
  if (b[2][2] !== 10) throw new Error('reshape');
}
{
  // slice
  /** a
   * [ [0, 1,  2,  3],
   *   [4, 5,  6,  7],
   *   [8, 9, 10, 11] ]
   */
  const a = np.reshape(np.seq(12), [3, 4]) as number[][];
  /** a
   * [ [5,  6],
   *   [9, 10] ]
   */
  const b = np.slice(a, [
    { begin: 1, end: 3 },
    { begin: 1, end: 3 },
  ]) as number[][];
  if (b[0][0] !== 5) throw new Error('slice');
  if (b[0][1] !== 6) throw new Error('slice');
  if (b[1][0] !== 9) throw new Error('slice');
  if (b[1][1] !== 10) throw new Error('slice');
}
{
  // transpose
  /** a
   * [ [0, 1,  2,  3],
   *   [4, 5,  6,  7],
   *   [8, 9, 10, 11] ]
   */
  const a = np.reshape(np.seq(12), [3, 4]) as number[][];

  /** b
   * [ [0, 4,  8],
   *   [1, 5,  9],
   *   [2, 6, 10],
   *   [3, 7, 11] ]
   */
  const b = np.transpose(a, [1, 0]) as number[][];
  if (b[1][2] !== 9) throw new Error('transpose');
  if (b[3][1] !== 7) throw new Error('transpose');

  /** c (2 x 3 x 4)
   * [ [ [ 0,  1,  2,  3 ],
   *     [ 4,  5,  6,  7 ],
   *     [ 8,  9, 10, 11 ] ],
   *   [ [12, 13, 14, 15 ],
   *     [16, 17, 18, 19 ],
   *     [20, 21, 22, 23 ] ] ],
   */
  const c = np.reshape(np.seq(24), [2, 3, 4]) as number[][][];

  /** d (3 x 4 x 2)
   * [ [ [ 0, 12 ], [ 1, 13 ], [  2, 14 ], [  3, 15 ] ],
   *   [ [ 4, 16 ], [ 5, 17 ], [  6, 18 ], [  7, 19 ] ],
   *   [ [ 8, 20 ], [ 9, 21 ], [ 10, 22 ], [ 11, 23 ] ] ]
   */
  const d = np.transpose(c, [1, 2, 0]) as number[][][];
  if (d[1][2][1] !== 18) throw new Error('transpose');
  if (d[2][3][0] !== 11) throw new Error('transpose');
}

{
  // zeros
  const z = np.zeros([2, 3, 4]) as number[][][];
  if (z.length !== 2) throw new Error('zeros');
  if (z[0].length !== 3) throw new Error('zeros');
  if (z[0][0].length !== 4) throw new Error('zeros');
  if (z[1][2][3] !== 0) throw new Error('zeros');
}
{
  // ones
  const empty = np.ones([]) as number;
  if (empty !== 1) throw new Error('ones');

  const o = np.ones([2]) as number[];
  if (o.length !== 2) throw new Error('ones');
  if (o[1] !== 1) throw new Error('ones');
}
{
  // exp
  const e1 = np.exp(np.ones([2, 3])) as number[][];
  if (e1[0][1] !== Math.exp(1)) throw new Error('exp');
  const e2 = np.exp(1);
  if (e2 !== Math.exp(1)) throw new Error('exp');
}
{
  // add
  const a = np.ones([3, 4, 5]);
  const b = np.ones([3, 4, 5]);
  const c = np.add(a, b) as number[][][];
  const d = np.add(c, b) as number[][][];
  if (c[2][3][4] !== 2) throw new Error('add');
  if (d[2][3][4] !== 3) throw new Error('add');
}
{
  // sub
  const a = np.ones([3, 4, 5]);
  const b = np.ones([3, 4, 5]);
  const c = np.add(a, b); // 2
  const d = np.add(c, b); // 3
  const e = np.sub(c, a) as number[][][]; // 1
  const f = np.sub(d, a) as number[][][]; // 2
  if (e[2][3][4] !== 1) throw new Error('sub');
  if (f[2][3][4] !== 2) throw new Error('sub');
}
{
  // mul
  const a = np.ones([3, 4, 5]);
  const b = np.ones([3, 4, 5]);
  const c = np.add(a, b); // 2
  const d = np.add(c, b); // 3
  const e = np.mul(c, a) as number[][][]; // 2
  const f = np.mul(c, d) as number[][][]; // 6
  if (e[2][3][4] !== 2) throw new Error('mul');
  if (f[2][3][4] !== 6) throw new Error('mul');
}
{
  // dot
  /**
   * matrix/matrix
   *
   * [ [1, 2],    [ [4, 2],    [ [ 4,  4],
   *   [3, 4] ] *   [0, 1] ] =   [12, 10] ]
   */
  const a = np.dot(
    [
      [1, 2],
      [3, 4],
    ],
    [
      [4, 2],
      [0, 1],
    ]
  ) as number[][];
  if (a[0][0] !== 4) throw new Error('dot (matrix/matrix)');
  if (a[0][1] !== 4) throw new Error('dot (matrix/matrix)');
  if (a[1][0] !== 12) throw new Error('dot (matrix/matrix)');
  if (a[1][1] !== 10) throw new Error('dot (matrix/matrix)');

  /**
   * vector/matrix
   *
   *          [ [1, 2],
   * [2, 4] *   [3, 4] ] = [14, 20]
   */
  const b = np.dot(
    [2, 4],
    [
      [1, 2],
      [3, 4],
    ]
  ) as number[];
  if (b[0] !== 14) throw new Error('dot (vector/matrix)');
  if (b[1] !== 20) throw new Error('dot (vector/matrix)');

  /**
   * matrix/vector
   *
   * [ [2, 4],    [ 3,    [ 14,
   *   [1, 3] ] *   2 ] =    9 ]
   */
  const c = np.dot(
    [
      [2, 4],
      [1, 3],
    ],
    [3, 2]
  ) as number[];
  if (c[0] !== 14) throw new Error('dot (matrix/vector)');
  if (c[1] !== 9) throw new Error('dot (matrix/vector)');

  // vector/vector
  const d = np.dot([5, 6], [3, 2]);
  if (d !== 5 * 3 + 6 * 2) throw new Error('dot (vector/vector)');
}
{
  // max
  /** a (2 x 3 x 4)
   * [ [ [ 0,  1,  2,  3 ],
   *     [ 4,  5,  6,  7 ],
   *     [ 8,  9, 10,  0 ] ],
   *   [ [ 1,  2,  3,  4 ],
   *     [ 5,  6,  7,  8 ],
   *     [ 9, 10,  0,  1 ] ] ],
   */
  const a = np.reshape(np.seq(24), [2, 3, 4]) as number[][][];
  np.updateValue(a, (x) => x % 11);

  if (np.max(a) !== 10) throw new Error('max');

  /**
   * [ [ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ], [ 9, 10, 10, 1 ] ]
   */
  const b = np.max(a, 0) as number[][];
  if (b[1][2] !== 7) throw new Error('max (axis = 0)');

  /**
   * [ [ 8, 9, 10, 7 ], [ 9, 10, 7, 8 ] ]
   */
  const c = np.max(a, 1) as number[][];
  if (c[1][0] !== 9) throw new Error('max (axis = 1)');

  /**
   * [ [ 3, 7, 10 ], [ 4, 8, 10 ] ]
   */
  const d = np.max(a, 2) as number[][];
  if (d[1][0] !== 4) throw new Error('max (axis = 2)');
}
{
  // sum
  /* ToDo */
}

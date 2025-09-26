import * as t from 'ts-fortress';

const PermissionsMask = t.bigint(0b11_1111n, {
  gte: 0n,
  lte: (1n << 6n) - 1n,
  multipleOf: 1n << 2n,
});

PermissionsMask.is(0b10_1100n); // true
PermissionsMask.is(0b10_1111n); // false (not divisible by 4)

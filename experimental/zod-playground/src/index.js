'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.toInt = exports.isInt = void 0;
const tslib_1 = require('tslib');
const z = tslib_1.__importStar(require('zod'));
const Int = z
  .number()
  .refine(
    (a) => Number.isInteger(a),
    (a) => ({ message: `Invalid value "${a}" supplied to Int` }),
  )
  .brand('Int');
const isInt = (a) => Int.safeParse(a).success;
exports.isInt = isInt;
const toInt = (a) => Int.parse(a);
exports.toInt = toInt;

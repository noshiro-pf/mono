"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var throttle_time_1 = require("./throttle-time");
utils_1.testStream(throttle_time_1.throttleTimeTestCases[0], [1, 7, 10, 13, 16]);
// testStream(throttleTimeTestCases[1], [
//   1,
//   1,
//   2,
//   3,
//   7,
//   7,
//   9,
//   10,
//   10,
//   12,
//   13,
//   13,
//   16,
//   16,
//   17,
//   18,
//   19,
//   20,
// ]);

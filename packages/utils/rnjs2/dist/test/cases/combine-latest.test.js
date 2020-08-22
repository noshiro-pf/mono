"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var combine_latest_1 = require("./combine-latest");
utils_1.testStream(combine_latest_1.combineLatestTestCases[0], [
    [0, 0, 0, 0, 0],
    [1, 2, 4, 1, 0],
    [2, 4, 8, 4, 4],
    [3, 6, 12, 9, 4],
    [4, 8, 16, 16, 16],
    [5, 10, 20, 25, 16],
    [6, 12, 24, 36, 36],
    [7, 14, 28, 49, 36],
    [8, 16, 32, 64, 64],
    [9, 18, 36, 81, 64],
]);

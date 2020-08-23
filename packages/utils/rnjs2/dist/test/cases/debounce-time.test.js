"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var debounce_time_1 = require("./debounce-time");
utils_1.testStream(debounce_time_1.debounceTimeTestCases[0], [
    [6, 4],
    [8, 4],
    [10, 4],
    [12, 4],
    [14, 4],
    [16, 4],
    [16, 14],
    [18, 14],
    [20, 14],
    [22, 14],
    [24, 14],
    [26, 14],
    [26, 24],
    [28, 24],
    [30, 24],
    [32, 24],
    [34, 24],
    [36, 24],
    [36, 34],
    [38, 34],
]);

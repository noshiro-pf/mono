"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var map_1 = require("./map");
utils_1.testStream(map_1.mapTestCases[0], [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
utils_1.testStream(map_1.mapTestCases[1], [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40]);
utils_1.testStream(map_1.mapTestCases[2], [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40]);

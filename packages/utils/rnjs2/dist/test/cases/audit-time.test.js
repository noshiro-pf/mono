"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var audit_time_1 = require("./audit-time");
utils_1.testStream(audit_time_1.auditTimeTestCases[0], [3, 4, 10, 13, 18, 20]);
utils_1.testStream(audit_time_1.auditTimeTestCases[1], [
    1,
    3,
    3,
    4,
    4,
    10,
    10,
    13,
    13,
    16,
    17,
    18,
    18,
    19,
    20,
    20,
]);

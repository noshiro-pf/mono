"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var argparse_1 = require("argparse");
var util_1 = require("../src/util");
var audit_time_1 = require("./cases/audit-time");
var combine_latest_1 = require("./cases/combine-latest");
var debounce_time_1 = require("./cases/debounce-time");
var filter_1 = require("./cases/filter");
var from_array_1 = require("./cases/from-array");
var interval_1 = require("./cases/interval");
var map_1 = require("./cases/map");
var merge_1 = require("./cases/merge");
var throttle_time_1 = require("./cases/throttle-time");
var timer_1 = require("./cases/timer");
var zip_1 = require("./cases/zip");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var exampleList = [
    { name: 'auditTime', cases: audit_time_1.auditTimeTestCases },
    { name: 'combineLatest', cases: combine_latest_1.combineLatestTestCases },
    { name: 'debounceTime', cases: debounce_time_1.debounceTimeTestCases },
    { name: 'filter', cases: filter_1.filterTestCases },
    { name: 'fromArray', cases: from_array_1.fromArrayTestCases },
    { name: 'interval', cases: interval_1.intervalTestCases },
    { name: 'map', cases: map_1.mapTestCases },
    { name: 'merge', cases: merge_1.mergeTestCases },
    { name: 'throttleTime', cases: throttle_time_1.throttleTimeTestCases },
    { name: 'timer', cases: timer_1.timerTestCases },
    { name: 'zip', cases: zip_1.zipTestCases },
];
var printExamples = function (exampleIdx) {
    console.log('examples:');
    exampleList.forEach(function (example, i) {
        var isSelected = exampleIdx === i;
        console.log("  " + (isSelected ? '[' : ' ') + (i + 1)
            .toString()
            .padStart(3) + ". " + example.name.padEnd(20) + (isSelected ? ']' : ' '));
    });
};
var printExampleCases = function (exampleCases, testCaseIdx) {
    console.log('test cases:');
    exampleCases.forEach(function (c, i) {
        var isSelected = testCaseIdx === i;
        console.log("  " + (isSelected ? '[' : ' ') + (i + 1)
            .toString()
            .padStart(3) + ". " + c.name.padEnd(30) + (isSelected ? ']' : ' '));
    });
};
var printSeparator = function () {
    console.log('---------------------------------');
};
var printIsPreviewMode = function (isPreviewMode) {
    console.log("mode: " + (isPreviewMode ? 'preview' : 'dump'));
};
var getArgs = function () {
    var parser = new argparse_1.ArgumentParser({
        version: '0.0.1',
        addHelp: true,
        description: 'Preview or dump stream test cases.',
    });
    parser.addArgument(['-x', '--example-no'], {
        help: 'Example No.',
        nargs: 1,
        required: true,
    });
    parser.addArgument(['-p', '--preview'], {
        help: 'Run in preview mode',
        nargs: 0,
        required: false,
    });
    parser.addArgument(['-c', '--case-no'], {
        help: 'Test case No.',
        nargs: 1,
        required: true,
    });
    var convertArgs = function (args) {
        var _a, _b;
        return ({
            exampleIdx: ((_a = util_1.toNumber(args.example_no[0])) !== null && _a !== void 0 ? _a : 0) - 1,
            isPreviewMode: args.preview != null,
            testCaseIdx: ((_b = util_1.toNumber(args.case_no[0])) !== null && _b !== void 0 ? _b : 0) - 1,
        });
    };
    return convertArgs(parser.parseArgs());
};
var main = function () {
    var _a = getArgs(), isPreviewMode = _a.isPreviewMode, exampleIdx = _a.exampleIdx, testCaseIdx = _a.testCaseIdx;
    console.log('');
    printIsPreviewMode(isPreviewMode);
    console.log('');
    printExamples(exampleIdx);
    console.log('');
    if (!utils_1.isInRange(exampleList, exampleIdx)) {
        console.error("example-no must be a value from 1 to " + exampleList.length + ".");
        return;
    }
    var example = exampleList[exampleIdx];
    printExampleCases(example.cases, testCaseIdx);
    console.log('');
    printSeparator();
    console.log('');
    if (!utils_1.isInRange(example.cases, testCaseIdx)) {
        console.error("case-no must be a value from 1 to " + example.cases.length + " for this example.");
        return;
    }
    var exampleCase = example.cases[testCaseIdx];
    if (isPreviewMode) {
        exampleCase.preview(constants_1.TICK.preview);
    }
    else {
        exampleCase.run(exampleCase.numTakeDefault, constants_1.TICK.test).then(console.log);
    }
};
main();

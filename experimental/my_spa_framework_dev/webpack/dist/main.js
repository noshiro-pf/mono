/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/App.ts":
/*!********************!*\
  !*** ./src/App.ts ***!
  \********************/
/*! exports provided: App */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"App\", function() { return App; });\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./src/utils.ts\");\n\n/**\n * <body>\n *   <h1>Hello world!!</h1>\n *   <button>+1</button>\n *   <button>-1</button>\n * </body>\n */\nvar App = function () {\n    // elements\n    var $h1 = document.createElement(\"h1\");\n    var $t0 = document.createTextNode(\"Hello \");\n    var $t1 = document.createTextNode(\"\");\n    var updateText_$t1 = function (text) {\n        $t1.data = text;\n    };\n    var $t2 = Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"createSpaceElement\"])();\n    var $button0 = document.createElement(\"button\");\n    $button0.textContent = \"+1\";\n    var $t3 = Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"createSpaceElement\"])();\n    var $button1 = document.createElement(\"button\");\n    $button1.textContent = \"-1\";\n    // states\n    var _a = Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"createState\"])(2), numRef = _a[0], updateNum = _a[2], onNumChangeFns = _a[3];\n    var _b = Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"createReactiveValue\"])(function () {\n        return new Array(numRef.value).fill(\"!\").join(\"\");\n    }), suffixRef = _b[0], updateSuffix = _b[1], onSuffixChangeFns = _b[2];\n    onNumChangeFns.push(updateSuffix);\n    updateSuffix(); // initialize\n    var _c = Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"createReactiveValue\"])(function () { return \"world\" + suffixRef.value; }), msgRef = _c[0], updateMsg = _c[1], onMsgChangeFns = _c[2];\n    onMsgChangeFns.push(function () { return updateText_$t1(msgRef.value); });\n    onSuffixChangeFns.push(updateMsg);\n    updateMsg(); // initialize\n    return {\n        mount: function (target) {\n            Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"insert\"])(target, $h1);\n            Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"append\"])($h1, $t0);\n            Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"append\"])($h1, $t1);\n            Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"insert\"])(target, $t2);\n            Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"insert\"])(target, $button0);\n            Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"insert\"])(target, $t3);\n            Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"insert\"])(target, $button1);\n            var dispose = [\n                Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"listen\"])($button0, \"click\", function () {\n                    updateNum(function (x) { return x + 1; });\n                }),\n                Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"listen\"])($button1, \"click\", function () {\n                    updateNum(function (x) { return Math.max(0, x - 1); });\n                }),\n            ];\n            return { dispose: dispose };\n        },\n    };\n};\n\n\n//# sourceURL=webpack:///./src/App.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App */ \"./src/App.ts\");\n\nObject(_App__WEBPACK_IMPORTED_MODULE_0__[\"App\"])().mount(document.body);\n\n\n//# sourceURL=webpack:///./src/main.ts?");

/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/*! exports provided: append, insert, detach, createSpaceElement, listen, runCallbacks, createReactiveValue, createState */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"append\", function() { return append; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"insert\", function() { return insert; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"detach\", function() { return detach; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createSpaceElement\", function() { return createSpaceElement; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"listen\", function() { return listen; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"runCallbacks\", function() { return runCallbacks; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createReactiveValue\", function() { return createReactiveValue; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createState\", function() { return createState; });\nvar append = function (target, node) {\n    return target.appendChild(node);\n};\nvar insert = function (target, node, anchor) { return target.insertBefore(node, anchor !== null && anchor !== void 0 ? anchor : null); };\nvar detach = function (node) {\n    var _a;\n    (_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(node);\n};\nvar createSpaceElement = function () { return document.createTextNode(\" \"); };\nvar listen = function (node, event, handler, options) {\n    node.addEventListener(event, handler, options);\n    return function () { return node.removeEventListener(event, handler, options); };\n};\nvar runCallbacks = function (fns) {\n    return fns.forEach(function (f) {\n        f();\n    });\n};\nvar createReactiveValue = function (setter) {\n    var valueRef = { value: setter() };\n    var onValueChangeFns = [];\n    var update = function () {\n        valueRef.value = setter();\n        runCallbacks(onValueChangeFns);\n    };\n    return [valueRef, update, onValueChangeFns];\n};\nvar createState = function (init) {\n    var stateRef = {\n        value: init,\n    };\n    var onStateChangeFns = [];\n    var setter = function (next) {\n        stateRef.value = next;\n        runCallbacks(onStateChangeFns);\n    };\n    var updater = function (fn) {\n        setter(fn(stateRef.value));\n    };\n    return [stateRef, setter, updater, onStateChangeFns];\n};\n\n\n//# sourceURL=webpack:///./src/utils.ts?");

/***/ })

/******/ });
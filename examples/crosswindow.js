(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CW = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CrossWindow", {
  enumerable: true,
  get: function get() {
    return _CrossWindow["default"];
  }
});
exports.createCrossWindow = createCrossWindow;
var _CrossWindow = _interopRequireDefault(require("./lib/CrossWindow.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function createCrossWindow() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new _CrossWindow["default"](options);
}

},{"./lib/CrossWindow.js":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var CommunicationManager = exports["default"] = /*#__PURE__*/function () {
  function CommunicationManager(channel, windowId, game, metadataManager) {
    _classCallCheck(this, CommunicationManager);
    this.channel = channel;
    this.windowId = windowId;
    this.game = game;
    this.metadataManager = metadataManager;
    this.events = {};
    this.setupListeners();
  }
  _createClass(CommunicationManager, [{
    key: "setupListeners",
    value: function setupListeners() {
      var _this = this;
      this.channel.onmessage = function (event) {
        var data = event.data;
        switch (data.action) {
          case 'createEntity':
            if (data.entities) data.entities.forEach(function (entity) {
              return _this.game.createEntity(entity);
            });
            break;
          case 'ping':
            if (data.sourceWindowId !== _this.windowId) _this.channel.postMessage({
              action: 'pong',
              sourceWindowId: _this.windowId
            });
            break;
          case 'pong':
            if (data.sourceWindowId !== _this.windowId) _this.metadataManager.markWindowAsActive(data.sourceWindowId);
            break;
          case 'sendMessage':
            if (data.targetWindowId === _this.windowId) _this.emit('message', data);
            break;
          case 'intersecting':
            if (data.sourceWindowId !== _this.windowId) _this.emit('intersecting', data.intersectionArea);
            break;
        }
      };
    }
  }, {
    key: "sendMessage",
    value: function sendMessage(targetWindowId, message) {
      this.channel.postMessage({
        action: 'sendMessage',
        targetWindowId: targetWindowId,
        payload: message
      });
    }
  }, {
    key: "on",
    value: function on(eventName, callback) {
      if (!this.events[eventName]) this.events[eventName] = [];
      this.events[eventName].push(callback);
    }
  }, {
    key: "emit",
    value: function emit(eventName, data) {
      var callbacks = this.events[eventName];
      if (callbacks) callbacks.forEach(function (callback) {
        return callback(data);
      });
    }
  }]);
  return CommunicationManager;
}();

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _getBestWindow = _interopRequireDefault(require("./getBestWindow.js"));
var _open = _interopRequireDefault(require("./open.js"));
var _CommunicationManager = _interopRequireDefault(require("./CommunicationManager.js"));
var _MetadataManager = _interopRequireDefault(require("./MetadataManager.js"));
var _IntersectionDetector = _interopRequireDefault(require("./IntersectionDetector.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } // CrossWindow.js - Marak Squires 2024
// A class to manage communication and entity movement between multiple windows
// Supports opening new windows, sending messages, and teleporting entities between windows
// Also supports detecting and handling window intersections
var CrossWindow = exports["default"] = /*#__PURE__*/function () {
  function CrossWindow(game) {
    var metadataKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'windowMetadata';
    _classCallCheck(this, CrossWindow);
    this.game = game;
    this.metadataKey = metadataKey;
    this.windowId = "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    this.metadataManager = new _MetadataManager["default"](metadataKey, this.windowId);
    this.communicationManager = new _CommunicationManager["default"](new BroadcastChannel('crosswindow_channel'), this.windowId, game, this.metadataManager);
    this.intersectionDetector = new _IntersectionDetector["default"](this.metadataManager, this.windowId);
    this.on = this.communicationManager.on.bind(this.communicationManager);
    this.emit = this.communicationManager.emit.bind(this.communicationManager);
    this.open = _open["default"].bind(this);
    this.getBestWindow = _getBestWindow["default"].bind(this);
    this.getWindowMetadata = this.metadataManager.getWindowMetadata.bind(this);
    // this.postMessage = this.communicationManager.sendMessage.bind(this.communicationManager);

    this.registerWindow();
  }
  _createClass(CrossWindow, [{
    key: "registerWindow",
    value: function registerWindow() {
      this.metadataManager.updateWindowMetadata();
      this.pingOtherWindows();
    }
  }, {
    key: "pingOtherWindows",
    value: function pingOtherWindows() {
      var _this = this;
      var channel = new BroadcastChannel('crosswindow_channel');
      channel.postMessage({
        action: 'ping',
        sourceWindowId: this.windowId
      });
      setTimeout(function () {
        return _this.metadataManager.removeInactiveWindows();
      }, 5000);
    }
  }, {
    key: "deregisterWindow",
    value: function deregisterWindow() {
      this.metadataManager.deregisterWindow();
    }
  }]);
  return CrossWindow;
}();

},{"./CommunicationManager.js":2,"./IntersectionDetector.js":4,"./MetadataManager.js":5,"./getBestWindow.js":6,"./open.js":7}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var IntersectionDetector = exports["default"] = /*#__PURE__*/function () {
  function IntersectionDetector(metadataManager, windowId) {
    _classCallCheck(this, IntersectionDetector);
    this.metadataManager = metadataManager;
    this.windowId = windowId;
    this.prevMetadata = null;
    this.startMetadataPolling();
  }
  _createClass(IntersectionDetector, [{
    key: "startMetadataPolling",
    value: function startMetadataPolling() {
      var _this = this;
      this.prevMetadata = this.metadataManager.getWindowMetadata();
      setInterval(function () {
        var currentMetadata = _this.metadataManager.getWindowMetadata();
        if (_this.metadataManager.hasMetadataChanged(_this.prevMetadata, currentMetadata)) {
          _this.metadataManager.updateWindowMetadata(currentMetadata);
          _this.checkForIntersections(currentMetadata);
        }
      }, 100);
    }
  }, {
    key: "checkForIntersections",
    value: function checkForIntersections(currentMetadata) {
      var _this2 = this;
      var allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataManager.metadataKey)) || {};
      Object.entries(allWindowsMetadata).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          windowId = _ref2[0],
          metadata = _ref2[1];
        if (windowId !== _this2.windowId && _this2.isOverlapping(currentMetadata, metadata)) {
          _this2.emitIntersectionEvent(windowId, _this2.calculateIntersection(currentMetadata, metadata));
        }
      });
    }
  }, {
    key: "isOverlapping",
    value: function isOverlapping(metadata1, metadata2) {
      return !(metadata2.position.x >= metadata1.position.x + metadata1.size.width || metadata2.position.x + metadata2.size.width <= metadata1.position.x || metadata2.position.y >= metadata1.position.y + metadata1.size.height || metadata2.position.y + metadata2.size.height <= metadata1.position.y);
    }
  }, {
    key: "calculateIntersection",
    value: function calculateIntersection(metadata1, metadata2) {
      var x1 = Math.max(metadata1.position.x, metadata2.position.x);
      var y1 = Math.max(metadata1.position.y, metadata2.position.y);
      var x2 = Math.min(metadata1.position.x + metadata1.size.width, metadata2.position.x + metadata2.size.width);
      var y2 = Math.min(metadata1.position.y + metadata1.size.height, metadata2.position.y + metadata2.size.height);
      return {
        position: {
          x: x1,
          y: y1
        },
        size: {
          width: x2 - x1,
          height: y2 - y1
        }
      };
    }
  }, {
    key: "emitIntersectionEvent",
    value: function emitIntersectionEvent(targetWindowId, intersectionArea) {
      var channel = new BroadcastChannel('crosswindow_channel');
      channel.postMessage({
        action: 'intersecting',
        sourceWindowId: this.windowId,
        targetWindowId: targetWindowId,
        intersectionArea: intersectionArea
      });
    }
  }]);
  return IntersectionDetector;
}();

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var MetadataManager = exports["default"] = /*#__PURE__*/function () {
  function MetadataManager(metadataKey, windowId) {
    _classCallCheck(this, MetadataManager);
    this.metadataKey = metadataKey;
    this.windowId = windowId;
  }
  _createClass(MetadataManager, [{
    key: "getWindowMetadata",
    value: function getWindowMetadata() {
      return {
        position: {
          x: window.screenX,
          y: window.screenY
        },
        size: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    }
  }, {
    key: "updateWindowMetadata",
    value: function updateWindowMetadata() {
      var metadata = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getWindowMetadata();
      var allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
      allWindowsMetadata[this.windowId] = _objectSpread(_objectSpread({}, metadata), {}, {
        lastActive: Date.now()
      });
      localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
    }
  }, {
    key: "hasMetadataChanged",
    value: function hasMetadataChanged(prevMetadata, currentMetadata) {
      return prevMetadata.position.x !== currentMetadata.position.x || prevMetadata.position.y !== currentMetadata.position.y || prevMetadata.size.width !== currentMetadata.size.width || prevMetadata.size.height !== currentMetadata.size.height;
    }
  }, {
    key: "removeInactiveWindows",
    value: function removeInactiveWindows() {
      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5000;
      var allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
      var currentTime = Date.now();
      Object.entries(allWindowsMetadata).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          windowId = _ref2[0],
          metadata = _ref2[1];
        if (currentTime - metadata.lastActive > timeout) {
          delete allWindowsMetadata[windowId];
        }
      });
      localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
    }
  }, {
    key: "markWindowAsActive",
    value: function markWindowAsActive(windowId) {
      var allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
      if (allWindowsMetadata[windowId]) {
        allWindowsMetadata[windowId].lastActive = Date.now();
        localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
      }
    }
  }, {
    key: "deregisterWindow",
    value: function deregisterWindow() {
      var allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
      delete allWindowsMetadata[this.windowId];
      localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
    }
  }]);
  return MetadataManager;
}();

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getBestWindow;
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function calculateEntryPosition(direction, position) {
  // TODO: Implement logic to calculate the entry position based on the exit direction and position
  position.x = -100;
  position.y = 0;
  return position;
}
function calculateDistance(point1, point2) {
  var dx = point1.x - point2.x;
  var dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function determineCardinalDirection(screenPosition) {
  // Use the screenPosition to determine the cardinal direction
  // This could be a simple check of x and y coordinates relative to the center of the screen
  var centerX = window.innerWidth / 2;
  var centerY = window.innerHeight / 2;
  if (screenPosition.x < centerX && screenPosition.y < centerY) return 'NW';
  if (screenPosition.x >= centerX && screenPosition.y < centerY) return 'NE';
  if (screenPosition.x >= centerX && screenPosition.y >= centerY) return 'SE';
  if (screenPosition.x < centerX && screenPosition.y >= centerY) return 'SW';
  // Add more granular direction checks if needed
}
function getBestWindow(entityData) {
  var _this = this;
  var direction = determineCardinalDirection(entityData.screenPosition);
  var allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
  console.log('getBestWindowgetBestWindow', entityData, direction, allWindowsMetadata, this.windowId);
  if (Object.keys(allWindowsMetadata).length === 0) {
    //alert('no other windows found');
    game.flashMessage('no other windows found');
  }
  var bestWindowId = null;
  var minDistance = Infinity;
  //game.flashMessage(Object.keys(allWindowsMetadata).length)
  Object.entries(allWindowsMetadata).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      windowId = _ref2[0],
      metadata = _ref2[1];
    bestWindowId = windowId; // for now
    if (windowId !== _this.windowId) {
      // Skip the current window
      var distance = calculateDistance(entityData.screenPosition, metadata.position);
      if (distance < minDistance) {
        minDistance = distance;
        bestWindowId = windowId;
      }
    }
  });
  if (bestWindowId) {
    // Return a window object with a .postMessage() method for the existing best window
    return {
      postMessage: function postMessage(data) {
        console.log('calling internal bestWindow.postMessage', bestWindowId, data);

        // Calculate the entry position based on the exit direction and position
        var newEntryPosition = calculateEntryPosition(direction, data.position);
        data.position = newEntryPosition;
        console.log("SENDING NEW POST", data);
        _this.communicationManager.sendMessage(bestWindowId, data);
        /*
        this.communicationManager.channel.postMessage({
          action: 'sendMessage',
          targetWindowId: bestWindowId,
          payload: data
        });
        */
      }
    };
  } else {
    game.flashMessage('could not find any windows');
    // Remark: Disabled auto-opening windows ( for now )
    return;
    // No suitable window found, create a new one and return a window object for it
    var newWindow = this.open('new_window_url.html', this.calculateWindowFeaturesForDirection(direction)); // Adjust URL and options as needed
    if (newWindow) {
      return {
        postMessage: function postMessage(message) {
          _this.channel.postMessage({
            action: 'sendMessage',
            // TODO: needs id? or auto-register?
            targetWindowId: _this.generateWindowId(),
            // Assuming new window gets a new ID
            payload: data
          });
        }
      };
    }
  }
}

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = open;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function open(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var adjustCurrentWindow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  // Check if URL is provided
  if (!url) {
    console.error('URL is required to open a new window.');
    return;
  }

  // Default window features
  var defaultFeatures = {
    width: 600,
    // Default width
    height: 400,
    // Default height
    menubar: 'no',
    toolbar: 'no',
    location: 'no',
    status: 'no',
    scrollbars: 'yes',
    resizable: 'yes',
    title: new Date().toISOString(),
    // Default title
    top: window.screenY + 100,
    // Default top position
    left: window.screenX + 100 // Default left position
  };

  // Merge default features with custom options
  var features = _objectSpread(_objectSpread({}, defaultFeatures), options);

  // If adjustCurrentWindow is true, resize and reposition the current window
  if (adjustCurrentWindow) {
    window.resizeTo(window.outerWidth / 2, window.outerHeight / 2);
    window.moveTo(features.left, features.top);
    // Adjust new window's size to fill the empty space
    features.width = window.outerWidth;
    features.height = window.outerHeight;
  }

  // Convert features object to a comma-separated string
  var featuresStr = Object.entries(features).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    return "".concat(key, "=").concat(value);
  }).join(',');

  // Open a new window with the specified URL, name, and configured features
  var newWindow = window.open(url, features.title, featuresStr);
  if (newWindow) {
    // If adjustCurrentWindow is true, position the new window to fill the empty space
    if (adjustCurrentWindow) {
      newWindow.moveTo(window.screenX + window.outerWidth, window.screenY);
    }
    // Return the reference to the new window for further use
    return newWindow;
  } else {
    console.error('Failed to open a new window. Please check browser popup settings.');
  }
}

},{}]},{},[1])(1)
});

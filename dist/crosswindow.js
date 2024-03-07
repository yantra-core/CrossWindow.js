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
  function CommunicationManager(channel, cw, game, metadataManager) {
    _classCallCheck(this, CommunicationManager);
    this.channel = channel;
    this.windowId = cw.windowId;
    this.game = game;
    this.cw = cw;
    this.metadataManager = metadataManager;
    this.setupListeners();
    this.startPing();
  }
  _createClass(CommunicationManager, [{
    key: "setupListeners",
    value: function setupListeners() {
      var _this = this;
      this.channel.onmessage = function (event) {
        var data = event.data;
        switch (data.action) {
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
            if (data.targetWindowId === 'any') _this.cw.emit('message', data);
            if (data.targetWindowId === _this.windowId) _this.cw.emit('message', data);
            break;
          case 'intersecting':
            if (data.sourceWindowId !== _this.windowId) _this.cw.emit('intersecting', data);
            break;
        }
      };
    }
  }, {
    key: "startPing",
    value: function startPing() {
      var _this2 = this;
      setInterval(function () {
        _this2.channel.postMessage({
          action: 'ping',
          sourceWindowId: _this2.windowId
        });
      }, 1000); // Send ping every second
    }
  }, {
    key: "sendMessage",
    value: function sendMessage(targetWindowId, message) {
      this.channel.postMessage({
        action: 'sendMessage',
        targetWindowId: targetWindowId,
        sourceWindowId: this.windowId,
        payload: message
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
var _updateOrCreateDebugContainer = _interopRequireDefault(require("./updateOrCreateDebugContainer.js"));
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
// The debug containers are optional, but useful for debugging so included with default package
// These could could be separate bundle to further reduce size
var CrossWindow = exports["default"] = /*#__PURE__*/function () {
  function CrossWindow(game) {
    var metadataKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'windowMetadata';
    _classCallCheck(this, CrossWindow);
    this.game = game;
    this.metadataKey = metadataKey;
    this.events = {};
    this.windowId = "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    this.metadataManager = new _MetadataManager["default"](metadataKey, this);
    this.communicationManager = new _CommunicationManager["default"](new BroadcastChannel('crosswindow_channel'), this, game, this.metadataManager);
    //this.on = this.communicationManager.on.bind(this.communicationManager);
    //this.emit = this.communicationManager.emit.bind(this.communicationManager);
    this.intersectionDetector = new _IntersectionDetector["default"](this.metadataManager, this.windowId);
    this.open = _open["default"].bind(this);
    this.getBestWindow = _getBestWindow["default"].bind(this);
    this.getWindows = this.metadataManager.getWindows.bind(this.metadataManager);
    this.getCurrentWindows = this.metadataManager.getCurrentWindows.bind(this.metadataManager);
    this.getWindowMetadata = this.metadataManager.getWindowMetadata.bind(this);
    this.pollWindows = this.metadataManager.pollWindows.bind(this.metadataManager);
    this.postMessage = this.communicationManager.sendMessage.bind(this.communicationManager);
    this.registerWindow();
    this.metadataManager.startHeartbeat();
    this.updateOrCreateDebugContainer = _updateOrCreateDebugContainer["default"].bind(this);
  }
  _createClass(CrossWindow, [{
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
  }, {
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
      }, 100);
    }
  }, {
    key: "deregisterWindow",
    value: function deregisterWindow() {
      this.metadataManager.deregisterWindow();
    }
  }]);
  return CrossWindow;
}();

},{"./CommunicationManager.js":2,"./IntersectionDetector.js":4,"./MetadataManager.js":5,"./getBestWindow.js":6,"./open.js":7,"./updateOrCreateDebugContainer.js":8}],4:[function(require,module,exports){
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
// The intersection detector class is responsible for detecting intersections between the current window and other windows.
// This can be used to create "x-ray" style effects, or shared entities between windows.
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
  function MetadataManager(metadataKey, cw) {
    _classCallCheck(this, MetadataManager);
    this.metadataKey = metadataKey;
    this.windowId = cw.windowId;
    this.emit = cw.emit.bind(cw);
    this.currentWindows = {};
  }
  _createClass(MetadataManager, [{
    key: "getCurrentWindows",
    value: function getCurrentWindows() {
      return this.currentWindows;
    }
  }, {
    key: "getWindows",
    value: function getWindows() {
      return JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    }
  }, {
    key: "startHeartbeat",
    value: function startHeartbeat() {
      var _this = this;
      setInterval(function () {
        _this.updateWindowMetadata(); // Update current window's metadata
        _this.removeInactiveWindows(200); // milliseconds
      }, 200); // Update every 200ms
    }
  }, {
    key: "pollWindows",
    value: function pollWindows() {
      var _this2 = this;
      var prevMetadata = this.getWindows(); // Store the initial state of all windows.

      setInterval(function () {
        var allWindows = _this2.getWindows(); // Fetch the current state of all windows.

        // Check for closed windows by comparing prevMetadata with the current state
        Object.keys(prevMetadata).forEach(function (windowId) {
          if (windowId === _this2.windowId) return; // Skip the current window
          if (!allWindows.hasOwnProperty(windowId)) {
            // If a window in prevMetadata is not present in allWindows, it's been closed
            console.log('gone', windowId, prevMetadata[windowId]);
            _this2.emit('windowClosed', {
              windowId: windowId,
              metadata: prevMetadata[windowId]
            });
          }
        });

        // Iterate through all current windows to check for changes or new windows
        Object.keys(allWindows).forEach(function (windowId) {
          var currentWindowMetadata = allWindows[windowId];
          var prevWindowMetadata = prevMetadata[windowId];

          // Check if the window is new or its metadata has changed
          //if (!prevWindowMetadata || this.hasMetadataChanged(prevWindowMetadata, currentWindowMetadata)) {
          // Update the previous metadata state for the next iteration
          prevMetadata[windowId] = currentWindowMetadata;
          _this2.currentWindows[windowId] = currentWindowMetadata;
          // Emit an event for the changed or new window
          // TODO: without the conditional statement this is now 'windowHeartbeat'
          // we should split the case and have two events to subscribe to
          _this2.emit('windowChanged', {
            windowId: windowId,
            metadata: currentWindowMetadata
          });
          // }
        });

        // Update prevMetadata to reflect the current state for the next iteration
        prevMetadata = _objectSpread({}, allWindows);
      }, 15);
    }
  }, {
    key: "hasMetadataChanged",
    value: function hasMetadataChanged(prevMetadata, currentMetadata) {
      return prevMetadata.position.x !== currentMetadata.position.x || prevMetadata.position.y !== currentMetadata.position.y || prevMetadata.size.width !== currentMetadata.size.width || prevMetadata.size.height !== currentMetadata.size.height;
    }
  }, {
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
    key: "removeInactiveWindows",
    value: function removeInactiveWindows() {
      var _this3 = this;
      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
      var allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
      var currentTime = Date.now();
      Object.entries(allWindowsMetadata).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          windowId = _ref2[0],
          metadata = _ref2[1];
        if (currentTime - metadata.lastActive > timeout) {
          delete allWindowsMetadata[windowId];
          _this3.currentWindows[windowId] = null;
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
function calculateEntryPosition(direction, position, bestWindowId) {
  // get the latest metadata about bestWindowId from localStorage
  var allWindowsMetadata = JSON.parse(localStorage.getItem('windowMetadata')) || {};
  var bestWindowMetadata = allWindowsMetadata[bestWindowId];
  if (!bestWindowMetadata) {
    console.error('calculateEntryPosition: bestWindowMetadata not found for windowId', bestWindowId);
    return;
  }

  // console.log('bestWindowMetadata', bestWindowMetadata)

  var bestWindowSize = bestWindowMetadata.size;
  var bestWindowPosition = bestWindowMetadata.position;
  // we need to determine if the calculated position is outside the bounds of the bestWindow
  // if it is, we need to clamp the value to the edge of the window
  // we are working with world coordinates at zoom scale value 1
  // so we can calculate the world coordinates of the window edges by using
  // the window position and size
  var gameWidth = bestWindowSize.width / 2;
  var gameHeight = bestWindowSize.height / 2;
  var currentWindowPosition = {
    x: screenX,
    y: screenY
  };

  // console.log('currentWindowPosition', currentWindowPosition)
  //console.log('bestWindowPosition', bestWindowPosition)
  //console.log('bestWindowSize', bestWindowSize)

  // Adjust this buffer size as needed
  var buffer = 66; // any small values should work, without buffer the entity may get stuck in teleportation loop
  console.log('calculateEntryPosition', direction, position);
  switch (direction) {
    case 'E':
    case 'NE':
    case 'SE':
      position.x = -gameWidth / 2 + buffer;
      break;
    case 'W':
    case 'SW':
    case 'NW':
      position.x = gameWidth / 2 - buffer;
      break;
    case 'N':
      position.y = gameHeight / 2 - buffer;
      break;
    case 'S':
      position.y = -gameHeight / 2 + buffer;
      break;
  }
  return position;
}
function calculateDistance(point1, point2) {
  var dx = point1.x - point2.x;
  var dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function determineCardinalDirection(screenPosition) {
  var centerX = window.innerWidth / 2;
  var centerY = window.innerHeight / 2;

  // Calculate the differences between the screen position and the center
  var diffX = Math.abs(screenPosition.x - centerX);
  var diffY = Math.abs(screenPosition.y - centerY);

  // Determine the predominant direction based on the larger difference
  if (diffX > diffY) {
    // Horizontal movement is predominant
    return screenPosition.x < centerX ? 'W' : 'E'; // West or East
  } else {
    // Vertical movement is predominant, or equal to horizontal movement
    return screenPosition.y < centerY ? 'N' : 'S'; // North or South
  }
}
function getBestWindow(entityData) {
  var _this = this;
  // TODO: entityData.position? we need an API semantic here for .position and .screenPosition
  var direction = determineCardinalDirection(entityData.screenPosition);
  var allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
  if (Object.keys(allWindowsMetadata).length === 0) {
    game.flashMessage('no other windows found');
    return;
  }
  var currentWindowPosition = getCurrentWindowPosition();
  var currentWindowSize = getCurrentWindowSize();
  var bestWindowId = null;
  var minEdgeDistance = Infinity;
  var fallbackWindowId = null;
  var minFallbackDistance = Infinity;
  Object.entries(allWindowsMetadata).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      windowId = _ref2[0],
      metadata = _ref2[1];
    if (windowId !== _this.windowId) {
      var edgeDistance = calculateEdgeDistance(direction, metadata.position, metadata.size, currentWindowPosition, currentWindowSize);
      if (direction === 'E' && metadata.position.x > currentWindowPosition.x) {
        // Consider windows to the right for East direction
        if (edgeDistance < minEdgeDistance) {
          minEdgeDistance = edgeDistance;
          bestWindowId = windowId;
        }
      } else if (direction === 'W' && metadata.position.x < currentWindowPosition.x) {
        // Consider windows to the left for West direction
        if (edgeDistance < minEdgeDistance) {
          minEdgeDistance = edgeDistance;
          bestWindowId = windowId;
        }
      } // Add similar checks for 'N' and 'S' directions if needed
      else if (direction === 'N' && metadata.position.y < currentWindowPosition.y) {
        // Consider windows to the left for West direction
        if (edgeDistance < minEdgeDistance) {
          minEdgeDistance = edgeDistance;
          bestWindowId = windowId;
        }
      } else if (direction === 'S' && metadata.position.y > currentWindowPosition.y) {
        // Consider windows to the left for West direction
        if (edgeDistance < minEdgeDistance) {
          minEdgeDistance = edgeDistance;
          bestWindowId = windowId;
        }
      }
      // Fallback for when no window is found in the preferred direction
      if (edgeDistance < minFallbackDistance) {
        minFallbackDistance = edgeDistance;
        fallbackWindowId = windowId;
      }
    }
  });

  // If no suitable window is found in the preferred direction, use the fallback
  if (!bestWindowId && fallbackWindowId) {
    bestWindowId = fallbackWindowId;
  }
  if (!bestWindowId) {
    bestWindowId = this.windowId;
  }
  return prepareBestWindowResponse(this, bestWindowId, direction, entityData);
}

// Helper function to get the current window's position
// Implement this based on how you track window positions in your application
function getCurrentWindowPosition() {
  // Example return value
  return {
    x: window.screenX,
    y: window.screenY
  };
}

// Helper function to get the current window's size
function getCurrentWindowSize() {
  // Example return value
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}
function calculateEdgeDistance(direction, targetWindowPosition, targetWindowSize, currentWindowPosition, currentWindowSize) {
  var edgeDistance;
  // console.log('calculateEdgeDistance', direction, targetWindowPosition, targetWindowSize, currentWindowPosition, currentWindowSize)
  switch (direction) {
    case 'E':
      // Entity is moving East, so we calculate the distance from the current window's right edge to the target window's left edge
      edgeDistance = targetWindowPosition.x - (currentWindowPosition.x + currentWindowSize.width);
      break;
    case 'W':
      // Entity is moving West, so we calculate the distance from the current window's left edge to the target window's right edge
      edgeDistance = currentWindowPosition.x - (targetWindowPosition.x + targetWindowSize.width);
      break;
    case 'N':
      // Entity is moving North, so we calculate the distance from the current window's top edge to the target window's bottom edge
      edgeDistance = currentWindowPosition.y - (targetWindowPosition.y + targetWindowSize.height);
      break;
    case 'S':
      // Entity is moving South, so we calculate the distance from the current window's bottom edge to the target window's top edge
      edgeDistance = targetWindowPosition.y - (currentWindowPosition.y + currentWindowSize.height);
      break;
    // Handle diagonal directions if needed by combining logic for horizontal and vertical edges
    // e.g., for NE, use the logic from N and E to find the shortest edge distance
    default:
      edgeDistance = Infinity; // Default case to handle unexpected directions
      break;
  }

  // console.log('calcuate distance', edgeDistance, direction, targetWindowPosition, targetWindowSize, currentWindowPosition, currentWindowSize)

  return edgeDistance;
}
function prepareBestWindowResponse(cw, bestWindowId, direction, entityData) {
  return {
    windowId: bestWindowId,
    direction: direction,
    entryPosition: calculateEntryPosition(direction, entityData.position, bestWindowId),
    postMessage: function postMessage(data) {
      var newEntryPosition = calculateEntryPosition(direction, data.position, bestWindowId);
      data.position = newEntryPosition;
      data.direction = direction;
      cw.communicationManager.sendMessage(bestWindowId, data);
    }
  };
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
  var adjustCurrentWindow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  if (!url) {
    console.error('URL is required to open a new window.');
    return;
  }
  var availableScreenWidth = screen.availWidth - window.screenX;
  var availableScreenHeight = screen.availHeight - window.screenY;
  var defaultFeatures = {
    width: Math.min(window.outerWidth, availableScreenWidth - 100),
    height: Math.min(window.outerHeight, availableScreenHeight - 100),
    menubar: 'no',
    toolbar: 'no',
    location: 'no',
    status: 'no',
    scrollbars: 'yes',
    resizable: 'yes',
    title: new Date().toISOString(),
    left: window.screenX + window.outerWidth + 100,
    top: window.screenY
  };
  var features = _objectSpread(_objectSpread({}, defaultFeatures), options);
  if (adjustCurrentWindow && (features.left + features.width > screen.availWidth || features.top + features.height > screen.availHeight)) {
    var halfWidth = Math.floor(window.outerWidth / 2);
    var halfHeight = Math.floor(window.outerHeight / 2);

    // window.resizeTo(halfWidth, halfHeight);

    // Determine an appropriate offset to maintain proximity without overlap
    var offsetX = window.screenX + halfWidth + features.width > screen.availWidth ? screen.availWidth - features.width - halfWidth : window.screenX;
    var offsetY = window.screenY + halfHeight + features.height > screen.availHeight ? screen.availHeight - features.height - halfHeight : window.screenY;

    // window.moveTo(offsetX, offsetY);

    features.width = halfWidth;
    features.height = halfHeight;
    features.left = offsetX + halfWidth; // Place new window to the right of the resized current window
    // features.top = offsetY; // Align new window's top with the current window's top
  }
  var featuresStr = Object.entries(features).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    return "".concat(key, "=").concat(value);
  }).join(',');
  var newWindow = window.open(url, features.title, featuresStr);
  if (newWindow) {
    return newWindow;
  } else {
    console.error('Failed to open a new window. Please check browser popup settings.');
  }
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = updateOrCreateDebugContainer;
function updateOrCreateDebugContainer(currentWindowMetadata) {
  var container = document.getElementById('windowsContainer');
  var boxId = 'windowBox_' + currentWindowMetadata.windowId;
  var windowBox = document.getElementById(boxId);
  if (!windowBox) {
    windowBox = document.createElement('div');
    windowBox.id = boxId;
    windowBox.style.textAlign = 'center';
    windowBox.classList.add('debug-window-box'); // Use CSS class for styling

    var windowIdSpan = document.createElement('span');
    windowIdSpan.style.backgroundColor = '#fff';
    windowIdSpan.style.height = '20px';
    windowIdSpan.style.fontWeight = 'bold';
    windowIdSpan.style.width = '100%';
    windowIdSpan.style.color = 'black';
    windowIdSpan.style.padding = '5px';
    windowIdSpan.style.margin = '0';
    if (currentWindowMetadata.windowId === this.windowId) {
      // Highlight our own window
      windowBox.style.borderColor = '#007fff';
    }
    windowIdSpan.textContent = currentWindowMetadata.windowId.split('-')[1];
    windowBox.appendChild(windowIdSpan);
    container.appendChild(windowBox);
  }
  var adjustedPosition = calculateAdjustedPosition(currentWindowMetadata);

  //console.log(currentWindowMetadata.windowId, this.windowId) 
  if (currentWindowMetadata.windowId === this.windowId) {
    // center the box always its our own
    //console.log("SEESESESESE")
    adjustedPosition.x = window.innerWidth / 2 - 55;
    adjustedPosition.y = window.innerHeight / 2 - adjustedPosition.height / 2 - 200;
    //windowBox.style.transform = 'translate(-50%, -50%)';
  }
  windowBox.style.left = "".concat(adjustedPosition.x, "px");
  windowBox.style.top = "".concat(adjustedPosition.y, "px");
  updatePositionInfo(windowBox, adjustedPosition, currentWindowMetadata);
}
function calculateAdjustedPosition(currentWindowMetadata) {
  var scaleFactor = 0.2; // Adjust scale factor as needed
  var buffer = 16; // Buffer to avoid edge sticking
  var viewportWidth = window.innerWidth;
  var viewportHeight = window.innerHeight;
  var _currentWindowMetadat = currentWindowMetadata.metadata.size,
    width = _currentWindowMetadat.width,
    height = _currentWindowMetadat.height;
  width *= scaleFactor;
  height *= scaleFactor;

  // Calculate relative position
  var x = currentWindowMetadata.metadata.position.x - window.screenX + width / 2;
  var y = currentWindowMetadata.metadata.position.y - window.screenY + height / 2;

  // Adjust to keep within viewport and apply buffer
  x = Math.min(Math.max(x, buffer), viewportWidth - width - buffer);
  y = Math.min(Math.max(y, buffer), viewportHeight - height - buffer);
  return {
    x: x,
    y: y,
    width: width,
    height: height
  };
}
function updatePositionInfo(windowBox, position, currentWindowMetadata) {
  var positionInfoSpan = windowBox.querySelector('.position-info');
  if (!positionInfoSpan) {
    positionInfoSpan = document.createElement('span');
    positionInfoSpan.className = 'position-info';
    positionInfoSpan.style.textAlign = 'left';
    windowBox.appendChild(positionInfoSpan);
  }
  var distance = calculateDistance(position, {
    x: window.screenX,
    y: window.screenY
  });
  positionInfoSpan.innerHTML = "X: ".concat(position.x.toFixed(0), "<br/>Y: ").concat(position.y.toFixed(0), "<br/>Dist: ").concat(Math.round(distance), "px");
}
function calculateDistance(point1, point2) {
  var dx = point1.x - point2.x;
  var dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

},{}]},{},[1])(1)
});

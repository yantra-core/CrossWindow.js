(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CWDEBUG = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CrossWindowDebugger", {
  enumerable: true,
  get: function get() {
    return _CrossWindowDebugger["default"];
  }
});
exports.createCrossWindowDebugger = createCrossWindowDebugger;
var _CrossWindowDebugger = _interopRequireDefault(require("./lib/CrossWindowDebugger.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function createCrossWindowDebugger() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new _CrossWindowDebugger["default"](options);
}

},{"./lib/CrossWindowDebugger.js":2}],2:[function(require,module,exports){
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
// CrossWindowDebugger.js - Marak Squires 2024
var CrossWindowDebugger = exports["default"] = /*#__PURE__*/function () {
  function CrossWindowDebugger(crossWindowInstance) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, CrossWindowDebugger);
    this.initUI();
    this.updateUI();
    this.crossWindowInstance = crossWindowInstance;
    // Define default styles for the debug window boxes
    this.defaultWindowBoxStyle = options.windowBoxStyle || {
      border: '2px solid white',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      fontSize: '1rem',
      position: 'absolute',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0.5em',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      zIndex: '11111',
      transition: 'transform 0.2s'
    };
  }
  _createClass(CrossWindowDebugger, [{
    key: "initUI",
    value: function initUI() {
      // Create and style windowsContainer
      var windowsContainer = document.createElement('div');
      windowsContainer.id = 'windowsContainer';
      Object.assign(windowsContainer.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'transparent',
        pointerEvents: 'none',
        zIndex: '22222'
      });
      document.body.appendChild(windowsContainer);

      // Create and style crossWindowCount
      var crossWindowCount = document.createElement('div');
      crossWindowCount.id = 'crossWindowCount';
      crossWindowCount.innerHTML = 'CrossWindows: <span id="crossWindowCountValue">0</span>';
      Object.assign(crossWindowCount.style, {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        padding: '0.5em',
        fontSize: '1em',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        zIndex: '9999'
      });
      document.body.appendChild(crossWindowCount);

      // Create and style currentCrossWindow
      var currentCrossWindow = document.createElement('div');
      currentCrossWindow.id = 'currentCrossWindow';
      var crossWindowIdSpan = document.createElement('span');
      crossWindowIdSpan.id = 'crossWindowId';
      crossWindowIdSpan.style.backgroundColor = '#fff';
      crossWindowIdSpan.style.height = '20px';
      crossWindowIdSpan.style.fontWeight = 'bold';
      crossWindowIdSpan.style.width = '100%';
      crossWindowIdSpan.style.color = 'black';
      crossWindowIdSpan.style.padding = '5px';
      crossWindowIdSpan.fontSize = '1.5em';
      currentCrossWindow.appendChild(crossWindowIdSpan);
      var br = document.createElement('br');
      currentCrossWindow.appendChild(br);
      var crossWindowPositionSpan = document.createElement('span');
      crossWindowPositionSpan.id = 'crossWindowPosition';
      crossWindowPositionSpan.style.backgroundColor = '#fff';
      crossWindowPositionSpan.style.height = '20px';
      crossWindowPositionSpan.style.fontWeight = 'normal';
      crossWindowPositionSpan.style.width = '100%';
      crossWindowPositionSpan.style.color = 'black';
      crossWindowPositionSpan.style.padding = '5px';
      crossWindowPositionSpan.fontSize = '1em';
      currentCrossWindow.appendChild(crossWindowPositionSpan);

      //currentCrossWindow.innerHTML = `<span id="crossWindowId">0</span><br/><span id="crossWindowPosition">0,0</span>`;
      Object.assign(currentCrossWindow.style, {
        position: 'absolute',
        bottom: '60px',
        left: '10px',
        padding: '0.5em',
        fontWeight: 'bold',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        zIndex: '9999'
      });
      document.body.appendChild(currentCrossWindow);
    }
  }, {
    key: "updateUI",
    value: function updateUI() {
      var _this = this;
      setInterval(function () {
        var currentWindows = _this.crossWindowInstance.getCurrentWindows();
        document.getElementById('crossWindowCountValue').innerText = Object.keys(currentWindows).length;
        document.getElementById('crossWindowId').innerText = _this.crossWindowInstance.windowId.split('-')[1];
        document.getElementById('crossWindowPosition').innerText = "x: ".concat(window.screenX, ", y: ").concat(window.screenY);

        // for each window updateOrCreateDebugContainer
        for (var windowId in currentWindows) {
          currentWindows[windowId].windowId = windowId;
          _this.updateOrCreateDebugContainer(currentWindows[windowId]);
        }
      }, 300);
    }
  }, {
    key: "updateOrCreateDebugContainer",
    value: function updateOrCreateDebugContainer(currentWindowMetadata) {
      // console.log("currentWindowMetadata", currentWindowMetadata, this.crossWindowInstance.windowId)
      if (currentWindowMetadata.windowId === this.crossWindowInstance.windowId) {
        return;
      }
      var container = document.getElementById('windowsContainer');
      var boxId = 'windowBox_' + currentWindowMetadata.windowId;
      var windowBox = document.getElementById(boxId);
      if (!windowBox) {
        windowBox = document.createElement('div');
        windowBox.id = boxId;
        windowBox.style.textAlign = 'center';

        // Apply the default window box styles
        Object.assign(windowBox.style, this.defaultWindowBoxStyle);
        var windowIdSpan = document.createElement('span');
        windowIdSpan.style.backgroundColor = '#fff';
        windowIdSpan.style.height = '20px';
        windowIdSpan.style.fontWeight = 'bold';
        windowIdSpan.style.width = '100%';
        windowIdSpan.style.color = 'black';
        windowIdSpan.style.padding = '5px';
        windowIdSpan.style.margin = '0';
        windowIdSpan.textContent = currentWindowMetadata.windowId.split('-')[1];
        windowBox.appendChild(windowIdSpan);
        container.appendChild(windowBox);
      }
      var adjustedPosition = calculateAdjustedPosition(currentWindowMetadata);

      //console.log(currentWindowMetadata.windowId, this.windowId) 
      if (currentWindowMetadata.windowId === this.crossWindowInstance.windowId) {
        // center the box always its our own
        adjustedPosition.x = window.innerWidth / 2 - 55;
        adjustedPosition.y = window.innerHeight / 2 - adjustedPosition.height / 2 - 200;
      }
      windowBox.style.left = "".concat(adjustedPosition.x, "px");
      windowBox.style.top = "".concat(adjustedPosition.y, "px");
      updatePositionInfo(windowBox, adjustedPosition, currentWindowMetadata);
    }
  }]);
  return CrossWindowDebugger;
}();
function calculateAdjustedPosition(currentWindowMetadata) {
  var scaleFactor = 0.2; // Adjust scale factor as needed
  var buffer = 16; // Buffer to avoid edge sticking
  var viewportWidth = window.innerWidth;
  var viewportHeight = window.innerHeight;
  var _currentWindowMetadat = currentWindowMetadata.size,
    width = _currentWindowMetadat.width,
    height = _currentWindowMetadat.height;
  width *= scaleFactor;
  height *= scaleFactor;

  // Calculate relative position
  var x = currentWindowMetadata.position.x - window.screenX + width / 2;
  var y = currentWindowMetadata.position.y - window.screenY + height / 2;

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

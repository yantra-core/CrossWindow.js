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
    this.config = {
      showOtherWindows: false,
      showWindowLegend: false,
      showPositionLegend: false,
      showOpenWindowButton: false,
      showExamplesBar: true,
      customStyles: false
    };
    for (var key in this.config) {
      if (typeof options[key] === 'boolean') {
        this.config[key] = options[key];
      }
    }
    this.displayedWindows = {};
    console.log('debugger using opts', 'config', this.config);
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
      //
      // Examples bar
      //
      if (this.config.showExamplesBar) {
        this.createExamplesBar();
      }

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

      //
      // Open Window button
      //
      if (this.config.showOpenWindowButton) {
        this.createOpenWindowButton();
      }

      //
      // Cross Window Count
      //
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
      if (this.config.showWindowLegend) {
        // Create and style currentCrossWindow
        var currentCrossWindow = document.createElement('div');
        currentCrossWindow.id = 'currentCrossWindow';

        //
        // Current Cross Window Legend
        //
        var crossWindowIdSpan = document.createElement('div');
        crossWindowIdSpan.id = 'crossWindowId';
        crossWindowIdSpan.style.backgroundColor = '#fff';
        crossWindowIdSpan.style.height = '20px';
        crossWindowIdSpan.style.fontWeight = 'bold';
        crossWindowIdSpan.style.width = '100%';
        crossWindowIdSpan.style.color = 'black';
        crossWindowIdSpan.style.padding = '5px';
        crossWindowIdSpan.fontSize = '1.5em';
        currentCrossWindow.appendChild(crossWindowIdSpan);

        //
        // Currnent Cross Window Position Legend
        //
        var crossWindowPositionSpan = document.createElement('div');
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
    }
  }, {
    key: "removeDebugContainer",
    value: function removeDebugContainer(windowId) {
      var containerId = "windowBox_".concat(windowId); // Assuming container IDs follow this pattern
      var containerElement = document.getElementById(containerId);
      if (containerElement) {
        containerElement.parentNode.removeChild(containerElement);
        delete this.displayedWindows[windowId]; // Remove the window from the tracking object
      }
    }
  }, {
    key: "createExamplesBar",
    value: function createExamplesBar() {
      var _this = this;
      var buttonBarContainer = document.createElement('div');
      buttonBarContainer.id = 'debuggerButtonBar';
      buttonBarContainer.classList.add('debuggerButtonBar');
      this.buttonConfigs = this.buttonConfigs || [{
        label: 'Home',
        url: 'https://yantra.gg/crosswindow/'
      }, {
        label: 'Particles',
        url: 'https://yantra.gg/crosswindow/particles'
      }, {
        label: 'Coins',
        url: 'https://yantra.gg/crosswindow/coins'
      }, {
        label: 'Key Typer',
        url: 'https://yantra.gg/crosswindow/keyboard-typer'
      }, {
        label: 'Piano',
        url: 'https://yantra.gg/crosswindow/piano'
      }, {
        label: 'Hexapods',
        url: 'https://yantra.gg/crosswindow/hexapods'
      }, {
        label: 'Maze',
        url: 'https://yantra.gg/crosswindow/maze'
      }];
      // Iterate over button configurations to create buttons
      this.buttonConfigs.forEach(function (config) {
        var button = document.createElement('button');
        button.textContent = config.label;
        button.addEventListener('click', function () {
          var windowWidth = window.innerWidth;
          var windowHeight = window.outerHeight - 75;
          var offsetX = window.screenX; // Current window's distance from the left edge of the screen
          var offsetY = window.screenY; // Current window's distance from the top edge of the screen
          var buffer = 10; // Define a buffer distance for the new window
          var top = offsetY,
            left = offsetX;
          // for dev
          config.url = config.url.replace('https://yantra.gg/crosswindow/', './');
          _this.crossWindowInstance.open(config.url + "?win=true", {
            width: windowWidth,
            height: windowHeight,
            top: top /*- window.outerHeight*/,
            left: left + window.outerWidth
          }, true);
        });
        buttonBarContainer.appendChild(button);
      });

      // Append the button bar container to the body
      document.body.appendChild(buttonBarContainer);
    }
  }, {
    key: "createOpenWindowButton",
    value: function createOpenWindowButton() {
      // Create the button container
      var buttonContainer = document.createElement('div');
      buttonContainer.id = 'openWindowButtons';
      Object.assign(buttonContainer.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        // Adjusted for demonstration
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5em',
        padding: '0.5em',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
      });

      // Create the button
      var openWindowButton = document.createElement('button');
      openWindowButton.textContent = 'Open Window';
      buttonContainer.appendChild(openWindowButton);

      // Append the button container to the body
      document.body.appendChild(buttonContainer);

      // Add the event listener to the button
      this.setupOpenWindowButtonListener(openWindowButton);
    }

    // TODO: more configuration options here
  }, {
    key: "setupOpenWindowButtonListener",
    value: function setupOpenWindowButtonListener(button) {
      var _this2 = this;
      button.addEventListener('click', function () {
        var windowWidth = window.innerWidth;
        var windowHeight = window.outerHeight - 75;
        var offsetX = window.screenX;
        var offsetY = window.screenY;
        var buffer = 10; // Optional buffer
        var top = offsetY + buffer;
        var left = offsetX + window.outerWidth + buffer;

        // Open new window
        // get the current url from the window
        var url = window.location.href;
        // add ?win=true to the url
        // if win=true is not already set
        if (!url.includes('?win=true')) {
          // the game
          url += '?win=true';
          // i win
        }
        _this2.crossWindowInstance.open(url, {
          width: windowWidth,
          height: windowHeight,
          top: top,
          left: left
        }, true);
      });
    }
  }, {
    key: "updateUI",
    value: function updateUI() {
      var _this3 = this;
      setInterval(function () {
        var currentWindows = _this3.crossWindowInstance.getCurrentWindows();
        var windowCountElement = document.getElementById('crossWindowCountValue');
        if (windowCountElement) {
          windowCountElement.innerText = Object.keys(currentWindows).length;
        }
        var windowIdElement = document.getElementById('crossWindowId');
        if (windowIdElement) {
          windowIdElement.innerText = _this3.crossWindowInstance.windowId.split('-')[1];
        }
        var windowPositionElement = document.getElementById('crossWindowPosition');
        if (windowPositionElement) {
          windowPositionElement.innerText = "x: ".concat(window.screenX, ", y: ").concat(window.screenY);
        }
        if (_this3.config.showOtherWindows) {
          var currentWindowIds = Object.keys(currentWindows);

          // Remove UI elements for windows that are no longer active
          Object.keys(_this3.displayedWindows).forEach(function (displayedWindowId) {
            if (!currentWindowIds.includes(displayedWindowId)) {
              _this3.removeDebugContainer(displayedWindowId);
            }
          });

          // Update or create UI elements for current windows
          currentWindowIds.forEach(function (windowId) {
            currentWindows[windowId].windowId = windowId;
            _this3.updateOrCreateDebugContainer(currentWindows[windowId]);
            _this3.displayedWindows[windowId] = true; // Mark this window as displayed
          });

          // Update the tracking object to reflect the current set of windows
          _this3.displayedWindows = currentWindowIds.reduce(function (acc, id) {
            acc[id] = true;
            return acc;
          }, {});
        }
      }, 300);
    }
  }, {
    key: "updateOrCreateDebugContainer",
    value: function updateOrCreateDebugContainer(currentWindowMetadata) {
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
        windowBox.classList.add('crosswindow-preview-box');

        // Apply the default window box styles
        if (this.config.customStyles !== true) {
          Object.assign(windowBox.style, this.defaultWindowBoxStyle);
        }
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

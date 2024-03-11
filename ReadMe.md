<h1 align="center">

  CrossWindow.js - Alpha
  
![cross-window-debugger](https://github.com/yantra-core/CrossWindow.js/assets/70011/6b851631-d4cd-419d-897e-3153d3bf1fb0)

![crosswindow-v7](https://github.com/yantra-core/CrossWindow.js/assets/70011/d6c4a335-6f96-45ce-bc96-b94143518226)


</h3>

<h4 align="center">
  <a href="https://yantra.gg/crosswindow">Live Demo</a> •
  <a href="#install">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a>
</h4>

**Alpha Notice**

A small utility library for cross window browser communication.

You can use CrossWindow.js to build applications that need to be aware of the positional metadata of other open browser windows. CrossWindow allows you to send spatially aware data messages to the "best" available window by ordinal value.

# How

  - Window Discovery and metadata handled by [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
  - Message broadcasting handled by [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
  - Window metadata is eventually consistent using Last-Write-Wins (LWW)

# Features

  - [✅] Offline cross-window browser messaging with registry
  - [✅] Get "best" available window from relative position to screen position
  - [✅] Optionally broadcast keyboard and mouse events to windows
  - [🟡] Intersection events for overlapping windows
  - [🟡] Cardinal direction helpers for window opening ( N,S,E,W )
  - [❌] Advanced windowing layouts ( cascade / tile / grid / etc )

**CDN Release Latest**
| Files          | CDN                                         | Size |
|---------------|--------------------------------------------------|-----------|
| crosswindow.js    | [Link](https://yantra.gg/crosswindow.js)        | 59kb      |
| crosswindow.min.js| [Link](https://yantra.gg/crosswindow.min.js)    | 28kb      |

## Videos and Live Demos

## Try it out yourself

Here are two demos to try:

### Simple Demo

[https://yantra.gg/crosswindow/simple](https://yantra.gg/crosswindow/simple)

https://github.com/yantra-core/CrossWindow.js/assets/70011/55946c29-6ec6-4202-a3a9-42a3408237a8


This simple demo runs CrossWindows's built-in debugger, showing the positional metadata of each connected browser window in real-time. Make sure to click "Open Window".

### Mantra.js Game Demos ( ALPHA )

These demos feature the Mantra.js `CrossWindow` plugin, which handles teleporation logic and makes some assumptions about entity position and zoom scale.

[https://yantra.gg/crosswindow](https://yantra.gg/crosswindow)

*This is an Alpha Game version! It won't be perfect...yet. Intersection events are in-progress to better implement overlapping crosswindows.*

https://github.com/yantra-core/CrossWindow.js/assets/70011/98cd90de-f226-43a6-a096-67cccffb3da7

In this example, the `Mantra` event emitter bridges to the `CrossWindow` event emitter. Each time a Game Entity exits the viewport, Mantra.js emits an event that CrossWindow.js sends to the best available open window based on the entity's exit position.

### Request Animation Loop Demo

Simple example demonstrating use of `requestAnimation` loop to detect if element has left viewport and then sends it to the next best window. `setTimeout` or `setInterval` would also work.

[https://yantra.gg/crosswindow/raf-loop](https://yantra.gg/crosswindow/raf-loop)

see: `./examples/raf-loop.html` for code

## Installation

**NPM**

```bash
npm install crosswindow
```

## Usage

```html
<script src="http://yantra.gg/crosswindow.js"></script>
<script src="http://yantra.gg/crosswindow.debugger.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', (event) => {

    // Initialize CrossWindow with the current window context and default event broadcasting settings
    let crosswindow = new CW.CrossWindow(window, {
      broadcastMouseEvents: true,    // Enable mouse event broadcasting across windows
      broadcastKeyboardEvents: true, // Enable keyboard event broadcasting across windows
    });

    // Set up the CrossWindow debugger with visual aids for debugging and window management
    let crossWindowDebugger = new CWDEBUG.CrossWindowDebugger(crosswindow, {
      showOtherWindows: true,        // Display other open windows in the debugger
      showWindowLegend: true,        // Show legends for window identification
      showPositionLegend: true,      // Show legends for window positions
      showOpenWindowButton: true,    // Include a button to open new windows
      showExamplesBar: false,        // Disable the examples bar for simplicity
      customStyles: true             // Apply custom styles to the debugger interface
    });

    // Add click event listeners to buttons for opening new windows
    document.querySelectorAll('#openWindowButtons button').forEach(button => {
      button.addEventListener('click', () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.outerHeight - 75;
        const offsetX = window.screenX; // Horizontal position of the current window
        const offsetY = window.screenY; // Vertical position of the current window
        let buffer = 10; // Margin between newly opened windows and the current window

        // Open a new window next to the current one, passing 'win=true' as metadata in the URL
        crosswindow.open('simple.html?win=true', {
          width: windowWidth,
          height: windowHeight,
          top: offsetY,
          left: offsetX + window.outerWidth + buffer,
        }, true);
      });
    });

    // Reference to the output area for logging events and messages
    let output = document.getElementById('messageOutput');

    // Event handler for when a new window is opened
    crosswindow.on('windowOpened', function (otherWindow) {
      console.log('windowOpened', crosswindow);
      output.value += 'windowOpened: ' + JSON.stringify(otherWindow, true, 2) + '\n';
      // Send a greeting message to the newly opened window
      otherWindow.postMessage({
        type: 'hello',
        message: 'Hello from ' + crosswindow.windowId
      });
    });

    // Event handler for when a window is closed
    crosswindow.on('windowClosed', function (currentWindowMetadata) {
      console.log('windowClosed', currentWindowMetadata);
      output.value += 'windowClosed: ' + JSON.stringify(currentWindowMetadata, true, 2) + '\n';
    });

    // Event handler for when a window's state changes (e.g., moved or resized)
    crosswindow.on('windowChanged', function (currentWindowMetadata) {
      console.log('windowChanged', currentWindowMetadata);
      output.value += 'windowChanged: ' + JSON.stringify(currentWindowMetadata, true, 2) + '\n';
    });

    // Event handler for keyboard events received from other windows
    crosswindow.on('keyEvent', function (event) {
      console.log('keyEvent', event);
      output.value += 'KeyEvent: ' + JSON.stringify(event, true, 2) + '\n';
    });

    // ^^^ TODO: Adds granular mouse and keyboard events with 1:1 DOM event name mappings

    // Event handler for messages received from other windows
    crosswindow.on('message', function (event) {
      console.log('message', event);
      output.value += 'Message: ' + JSON.stringify(event, true, 2) + '\n';
    });

    // Retrieve and log all managed CrossWindow instances
    let allCrossWindows = crosswindow.getWindows();
    console.log('allCrossWindows', allCrossWindows);
    output.value += 'All CrossWindows: ' + JSON.stringify(allCrossWindows, true, 2) + '\n';

    // Demonstrate retrieving a specific window by ID and sending a message
    let theWindow = crosswindow.getWindowById(crosswindow.windowId); // Get the current window by its ID
    console.log('theWindow', theWindow);
    if (theWindow) {
      theWindow.postMessage({
        type: 'hello',
        message: 'Hello from self: ' + crosswindow.windowId
      });
    }

    // Periodically find and message the "best" window based on a desired position
    setInterval(function () {
      let bestWindow = crosswindow.getBestWindow({
        position: { x: 100, y: 100 },      // Current viewport position within the window
        screenPosition: { x: 1000, y: 1000 } // Desired screen position for message targeting
      });

      console.log('bestWindow', bestWindow);
      // Send a message to the identified best window with arbitrary metadata
      bestWindow.postMessage({
        // position is optional and used to calculate entry position
        position: { x: 100, y: 100 },
        // abritrary metadata
        name: 'Bobby',
        health: 99,
        team: 'Discovery Channel',
        message: 'Hello from ' + crosswindow.windowId
      });

      // truncate the output area to prevent it from getting too long
      if (output.value.length > 20000) {
        output.value = output.value.substring(output.value.length - 1000);
      }

    }, 1000); // Message interval set to 1000 milliseconds (1 second)

  });
</script>

```

**Debugger Latest**
| Files          | CDN                                         | Size |
|---------------|--------------------------------------------------|-----------|
| crosswindow.debugger.js    | [Link](https://yantra.gg/crosswindow.debugger.js)        | 18kb      |
| crosswindow.debugger.min.js| [Link](https://yantra.gg/crosswindow.debugger.min.js)    | 9kb      |

# Detecting if an element has left the Viewport

CrossWindow.js makes few assumptions about your cross window applications.

In order to track if a DOM element has left the viewport ( and perhaps needs to be sent to another window ), you will need to create a loop with a timer and framerate.

You can use: `requestAnimationFrame`, `setTimeout`, or `setInterval` in order to poll the state of the DOM and emit events ( such as finding the best window or opening new windows ).

see: [https://yantra.gg/crosswindow/raf-loop](https://yantra.gg/crosswindow/raf-loop)

see: `./examples/raf-loop.html` for full working code

```js
function trackElementVisibilityRAF(elementId) {
  function checkVisibility() {
    const element = document.getElementById(elementId);
    if (!element) {
      requestAnimationFrame(checkVisibility); // Keep trying until found
      return;
    }

    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0 && rect.left < window.innerWidth && rect.right >= 0;

    if (!isVisible) {
      console.log(`Element with ID '${elementId}' has left the viewport.`);
      // Perform any actions needed when the element is out of the viewport
      let bestWindow = crosswindow.getBestWindow({
        position: {
          x: rect.left,
          y: rect.top
        },
        screenPosition: { // send the element to the right of the current window
          x: window.screenX + window.outerWidth,
          y: window.screenY
        }
      });

      // Removes the element from current window
      element.remove();

      // sends element metadata to best window for processing
      // listen to event with: currentwindow.on('message', fn);
      bestWindow.postMessage({
        id: elementId,
        position: {
          x: rect.left,
          y: rect.top
        }
      });

    }

    requestAnimationFrame(checkVisibility); // Continue the loop
  }

  checkVisibility(); // Start the loop
}

trackElementVisibilityRAF('my-element');


```


## Contributing

## TypeScript Definitions

If anyone wishes to add TypeScript defs for the project, please open a PR and we can merge them.

## Unit Tests

CrossWindow.js is currently short on tests. We'll want to add tests. `tap` or `tape` are great.


# Copyright Yantra Works 2024 AGPL

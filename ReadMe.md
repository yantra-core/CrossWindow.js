<h1 align="center">

  CrossWindow.js - Alpha
  
![cross-window-debugger](https://github.com/yantra-core/CrossWindow.js/assets/70011/6b851631-d4cd-419d-897e-3153d3bf1fb0)


![cross-window-mantra-3](https://github.com/yantra-core/CrossWindow.js/assets/70011/d243d930-f098-4b2e-9136-89ea1bbbc000)

</h3>

<h4 align="center">
  <a href="https://yantra.gg/crosswindow">Live Demo</a> •
  <a href="#install">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a>
</h4>


A `22kb` utility library for cross-window communication using LocalStorage and BroadcastChannel.

You can use CrossWindow.js to build applications that need to be aware of the positional metadata of other open browser windows. CrossWindow allows you to send spatially aware data messages to the "best" available window by ordinal value.

**CDN Release Latest**
| Files          | CDN                                         | Size |
|---------------|--------------------------------------------------|-----------|
| crosswindow.js    | [Link](https://yantra.gg/crosswindow.js)        | 44kb      |
| crosswindow.min.js| [Link](https://yantra.gg/crosswindow.min.js)    | 22kb      |

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

https://github.com/yantra-core/CrossWindow.js/assets/70011/a2b4f208-1df8-4957-970e-333296a45a0c

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

    let crosswindow = new CW.CrossWindow(window, {
      broadcastKeyboardEvents: true,
      broadcastMouseEvents: true
    });

    let crossWindowDebugger = new CWDEBUG.CrossWindowDebugger(crosswindow, {
      showOtherWindows: true,
      showWindowLegend: true,
      showWindowCount: true,
    });

    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.outerHeight - 75;
        const top = window.screenX;
        const left = window.screenY;

        // Open new CrossWindow
        crosswindow.open('this-page-or-another-crosswindow-page.html', {
          width: windowWidth,
          height: windowHeight,
          top: top,
          left: left + window.outerWidth, // opens to the right
        }, true);

      });
    });

    crosswindow.on('windowClosed', function (currentWindowMetadata) {
      console.log('windowClosed', currentWindowMetadata);
    });

    crosswindow.on('windowChanged', function (currentWindowMetadata) {
      // console.log('windowChanged', currentWindowMetadata);
    });

    crosswindow.on('message', function (event) {
      console.log('message', event);
    });

    setInterval(function () {
      let bestWindow = crosswindow.getBestWindow({
        // the current position we are at in the current window
        position: { // currentViewportPosition
          x: 100,
          y: 100
        },
        // any position on or off the screen, using screenX and screenY as the reference
        screenPosition: { // requested screen position
          x: 1000,
          y: 1000
        }
      });

      console.log('bestWindow', bestWindow)

      // use BroadcastChannel postMessage to send a message to the best window
      bestWindow.postMessage({
        // this is all arbitrary metadata
        name: 'Bobby',
        health: 99,
        team: 'Discovery Channel',
        // Inside our crosswindow.on('message', fn) handler we can add custom logic,
        // for determining what to do with the data, such as creating a new entity.
        // The Mantra demo uses previous position to determine entrance position
        previousPosition: {
          x: 100,
          y: 100
        },
        message: 'Hello from ' + crosswindow.windowId
      })

    }, 1000);

  });
</script>

```

**Debugger Latest**
| Files          | CDN                                         | Size |
|---------------|--------------------------------------------------|-----------|
| crosswindow.debugger.js    | [Link](https://yantra.gg/crosswindow.debugger.js)        | 12kb      |
| crosswindow.debugger.min.js| [Link](https://yantra.gg/crosswindow.debugger.min.js)    | 6kb      |

# How

  - Window Discovery and metadata handled by [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
  - Message broadcasting handled by [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
  - Light touch of Javascript

# Features

  - [✅] Offline cross-browser window messaging with registry
  - [✅] Get "best" available window from relative position to screen position
  - [✅] Optionally broadcast keyboard and mouse events to windows
  - [🟡] Intersection events for overlapping windows ( WIP needs demo )
  - [🟡] Cardinal direction helpers for window opening ( N,S,E,W )
  - [❌] Advanced windowing layouts ( cascade / tile / grid / etc )

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

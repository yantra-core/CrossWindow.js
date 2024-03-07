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

CrossWindow.js is used for building web applications that need to be aware of the positional data of other open browser windows. It's useful for building apps that need to teleport objects between open windows.

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

### Mantra.js Game Demo ( ALPHA )

*This is an Alpha Game version! It won't be perfect...yet*

[https://yantra.gg/crosswindow](https://yantra.gg/crosswindow)

https://github.com/yantra-core/CrossWindow.js/assets/70011/a2b4f208-1df8-4957-970e-333296a45a0c

This more featured demo contains a Mantra.js game instance, a Player with arrows, and some NPCS. Try opening a window and shooting some arrows.

In this example, the Mantra.js event emitter bridges to the `CrossWindow` event emitter. Each time a Game Entity exits the viewport, Mantra emits an event that CrossWindow.js sends to the best available open window based on the entity's exit position.


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

    let crosswindow = new CW.CrossWindow(window);

    let crossWindowDebugger = new CWDEBUG.CrossWindowDebugger(crosswindow, {
      showOtherWindows: true,
      showWindowLegend: true,
      showWindowCount: true
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
          left: left + window.outerWidth,
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
        position: {
          x: 100,
          y: 100
        },
        // any position on or off the screen, using screenX and screenY as the reference
        screenPosition: {
          x: 1000,
          y: 1000
        }
      });

      console.log('bestWindow', bestWindow)

      // use BroadcastChannel postMessage to send a message to the best window
      bestWindow.postMessage({
        name: 'Bobby',
        health: 99,
        team: 'Discovery Channel',
        position: {
          x: 100,
          y: 100
        },
        message: 'Hello from the main window'
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

  - [✅] Opens and manages browser with Cross Window communications
  - [✅] `getBestWindow(screenPosition)` for calculating "best" window for screen position
  - [✅]  Intersection events for overlapping windows ( WIP needs demo )

## Contributing

## TypeScript Definitions

If anyone wishes to add TypeScript defs for the project, please open a PR and we can merge them.

## Unit Tests

CrossWindow.js is currently short on tests. We'll want to add tests. `tap` or `tape` are great.


# Copyright Yantra Works 2024 AGPL

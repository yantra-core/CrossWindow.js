

<h3 align="center">

# CrossWindow.js

</h3>

<h4 align="center">
  <a href="https://yantra.gg/crosswindow">Live Demo</a> •
  <a href="#install">Installation</a> •
  <a href="#contributing">Contributing</a>
</h4>



A 22kb library for managing spatially aware cross-window browser messages. 

CrossWindow.js is used for building web applications that need to be aware of the positional data of other open browser windows. It's useful for building apps that need to teleport objects between browser windows.

*image here*

# IT CAN TELEPORT OBJECTS BETWEEN BROWSER WINDOWS



## Video and Live Demos

To see how this works, watch this demo video: 

*video here*


Here we have a Mantra.js game instance event emitter bridged to the events emitted from `CrossWindow`. Each time a Game Entity exits the viewport, CrossWindow.js is used to send a message containing the Player data to the best available window.

## Try it out yourself

Here are two demos try:

### Simple Demo

[https://yantra.gg/crosswindow](https://yantra.gg/crosswindow/simple)

This simple demo runs CrossWindows's built-in debugger, showing the positional metadata of each connected browser window in real-time. Make sure to click "Open Window".

### Mantra.js Game Demo

[https://yantra.gg/crosswindow](https://yantra.gg/crosswindow)

This more featured demo contains a Mantra.js game instance, a Player with arrows, and some NPCS. Try opening a window and shooting some arrows.

## Installation

**CDN Release 1.1.0**
| Files          | CDN                                         | Size |
|---------------|--------------------------------------------------|-----------|
| crosswindow.js    | [Link](https://yantra.gg/crosswindow.js)        | 46kb      |
| crosswindow.min.js| [Link](https://yantra.gg/crosswindow.min.js)    | 22kb      |

**NPM**

```bash
npm install crosswindow
```

**Browser**

```html
<a name="install"></a>
```


# How

  - Window Discovery and metadata handled by Local Storage
  - Message broadcasting handled by Broadcast Channel
  - Light touch of Javascript

# Features

  - Opens and manages browser with Cross Window communications
  - Built in `crosswindow.getBestWindow(screenPosition)` method for calculating best window to place entity
  - Intersection events for overlapping windows ( WIP )


### Contributing

#### TypeScript Definitions

If anyone wishes to add TypeScript defs for the project, please open a PR and we can merge them.

#### Unit Tests

CrossWindow.js is currently short on tests. We'll want to add tests.


# Copyright Yantra Works 2024 AGPL
// CrossWindowDebugger.js - Marak Squires 2024
export default class CrossWindowDebugger {
  constructor(crossWindowInstance, options = {}) {

    this.config = {
      showOtherWindows: false,
      showWindowLegend: false,
      showPositionLegend: false,
      showOpenWindowButton: false,
      showExamplesBar: true,
      customStyles: false,
    };

    for (let key in this.config) {
      if (typeof options[key] === 'boolean') {
        this.config[key] = options[key];
      }
    }
    console.log('debugger using opts', 'config', this.config)
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
      transition: 'transform 0.2s',
    };

  }

  initUI() {

    //
    // Examples bar
    //
    if (this.config.showExamplesBar) {
      this.createExamplesBar();
    }


    // Create and style windowsContainer
    const windowsContainer = document.createElement('div');
    windowsContainer.id = 'windowsContainer';
    Object.assign(windowsContainer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'transparent',
      pointerEvents: 'none',
      zIndex: '22222',
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
    const crossWindowCount = document.createElement('div');
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
      zIndex: '9999',
    });
    document.body.appendChild(crossWindowCount);

    if (this.config.showWindowLegend) {

      // Create and style currentCrossWindow
      const currentCrossWindow = document.createElement('div');
      currentCrossWindow.id = 'currentCrossWindow';

      //
      // Current Cross Window Legend
      //
      let crossWindowIdSpan = document.createElement('div');
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
      let crossWindowPositionSpan = document.createElement('div');
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
        zIndex: '9999',
      });
      document.body.appendChild(currentCrossWindow);

    }

  }

  createExamplesBar() {

    const buttonBarContainer = document.createElement('div');
    buttonBarContainer.id = 'debuggerButtonBar';
    buttonBarContainer.classList.add('debuggerButtonBar');

    this.buttonConfigs = this.buttonConfigs || [
      { label: 'Home', url: 'https://yantra.gg/crosswindow/' },
      { label: 'Particles', url: 'https://yantra.gg/crosswindow/particles' },
      { label: 'Coins', url: 'https://yantra.gg/crosswindow/coins' },
      { label: 'Key Typer', url: 'https://yantra.gg/crosswindow/keyboard-typer' },
      { label: 'Piano', url: 'https://yantra.gg/crosswindow/piano' },
      { label: 'Hexapods', url: 'https://yantra.gg/crosswindow/hexapods' },
      { label: 'Maze', url: 'https://yantra.gg/crosswindow/maze' },
    ];
    // Iterate over button configurations to create buttons
    this.buttonConfigs.forEach(config => {
      const button = document.createElement('button');
      button.textContent = config.label;

      button.addEventListener('click', () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.outerHeight - 75;
        const offsetX = window.screenX; // Current window's distance from the left edge of the screen
        const offsetY = window.screenY; // Current window's distance from the top edge of the screen
        let buffer = 10; // Define a buffer distance for the new window
        let top = offsetY, left = offsetX;
        // for dev
        config.url = config.url.replace('https://yantra.gg/crosswindow/', './')
        this.crossWindowInstance.open(config.url + "?win=true", {
          width: windowWidth,
          height: windowHeight,
          top: top /*- window.outerHeight*/,
          left: left + window.outerWidth,
        }, true);

      });
      buttonBarContainer.appendChild(button);
    });

    // Append the button bar container to the body
    document.body.appendChild(buttonBarContainer);
  }

  createOpenWindowButton() {
    // Create the button container
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'openWindowButtons';
    Object.assign(buttonContainer.style, {
      position: 'absolute',
      top: '10px',
      right: '10px', // Adjusted for demonstration
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5em',
      padding: '0.5em',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    });

    // Create the button
    const openWindowButton = document.createElement('button');
    openWindowButton.textContent = 'Open Window';
    buttonContainer.appendChild(openWindowButton);

    // Append the button container to the body
    document.body.appendChild(buttonContainer);

    // Add the event listener to the button
    this.setupOpenWindowButtonListener(openWindowButton);
  }


  // TODO: more configuration options here
  setupOpenWindowButtonListener(button) {
    button.addEventListener('click', () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.outerHeight - 75;
      const offsetX = window.screenX;
      const offsetY = window.screenY;
      let buffer = 10; // Optional buffer
      let top = offsetY + buffer;
      let left = offsetX + window.outerWidth + buffer;

      // Open new window
      // get the current url from the window
      let url = window.location.href;
      // add ?win=true to the url
      // if win=true is not already set
      if (!url.includes('?win=true')) {
        // the game
        url += '?win=true';
        // i win
      }
      this.crossWindowInstance.open(url, {
        width: windowWidth,
        height: windowHeight,
        top: top,
        left: left,
      }, true);
    });
  }

  updateUI() {
    setInterval(() => {
      const currentWindows = this.crossWindowInstance.getCurrentWindows();

      let windowCountElement = document.getElementById('crossWindowCountValue');
      if (windowCountElement) {
        windowCountElement.innerText = Object.keys(currentWindows).length;
      }

      let windowIdElement = document.getElementById('crossWindowId');
      if (windowIdElement) {
        windowIdElement.innerText = this.crossWindowInstance.windowId.split('-')[1];
      }

      let windowPositionElement = document.getElementById('crossWindowPosition');
      if (windowPositionElement) {
        windowPositionElement.innerText = `x: ${window.screenX}, y: ${window.screenY}`;
      }

      if (this.config.showOtherWindows) {
        // for each window updateOrCreateDebugContainer
        for (const windowId in currentWindows) {
          currentWindows[windowId].windowId = windowId;
          this.updateOrCreateDebugContainer(currentWindows[windowId]);
        }
      }

    }, 300);
  }

  updateOrCreateDebugContainer(currentWindowMetadata) {
    // console.log("currentWindowMetadata", currentWindowMetadata, this.crossWindowInstance.windowId)
    if (currentWindowMetadata.windowId === this.crossWindowInstance.windowId) {
      return;
    }

    const container = document.getElementById('windowsContainer');
    const boxId = 'windowBox_' + currentWindowMetadata.windowId;
    let windowBox = document.getElementById(boxId);

    if (!windowBox) {

      windowBox = document.createElement('div');
      windowBox.id = boxId;
      windowBox.style.textAlign = 'center';
      windowBox.classList.add('crosswindow-preview-box');

      // Apply the default window box styles
      if (this.config.customStyles !== true) {
        Object.assign(windowBox.style, this.defaultWindowBoxStyle);
      }
      let windowIdSpan = document.createElement('span');
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

    const adjustedPosition = calculateAdjustedPosition(currentWindowMetadata.metadata);

    //console.log(currentWindowMetadata.windowId, this.windowId) 
    if (currentWindowMetadata.windowId === this.crossWindowInstance.windowId) {
      // center the box always its our own
      adjustedPosition.x = window.innerWidth / 2 - 55;
      adjustedPosition.y = window.innerHeight / 2 - adjustedPosition.height / 2 - 200;
    }

    windowBox.style.left = `${adjustedPosition.x}px`;
    windowBox.style.top = `${adjustedPosition.y}px`;

    updatePositionInfo(windowBox, adjustedPosition, currentWindowMetadata);
  }

}

function calculateAdjustedPosition(currentWindowMetadata) {
  const scaleFactor = 0.2; // Adjust scale factor as needed
  const buffer = 16; // Buffer to avoid edge sticking
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let { width, height } = currentWindowMetadata.size;

  width *= scaleFactor;
  height *= scaleFactor;

  // Calculate relative position
  let x = currentWindowMetadata.position.x - window.screenX + (width / 2);
  let y = currentWindowMetadata.position.y - window.screenY + (height / 2);

  // Adjust to keep within viewport and apply buffer
  x = Math.min(Math.max(x, buffer), viewportWidth - width - buffer);
  y = Math.min(Math.max(y, buffer), viewportHeight - height - buffer);

  return { x, y, width, height };
}

function updatePositionInfo(windowBox, position, currentWindowMetadata) {
  let positionInfoSpan = windowBox.querySelector('.position-info');
  if (!positionInfoSpan) {
    positionInfoSpan = document.createElement('span');
    positionInfoSpan.className = 'position-info';
    positionInfoSpan.style.textAlign = 'left';
    windowBox.appendChild(positionInfoSpan);
  }

  const distance = calculateDistance(position, {
    x: window.screenX,
    y: window.screenY,
  });

  positionInfoSpan.innerHTML = `X: ${position.x.toFixed(0)}<br/>Y: ${position.y.toFixed(0)}<br/>Dist: ${Math.round(distance)}px`;
}

function calculateDistance(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}


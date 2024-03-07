// CrossWindowDebugger.js - Marak Squires 2024
export default class CrossWindowDebugger {
  constructor(crossWindowInstance) {
    this.initUI();
    this.updateUI();
    this.crossWindowInstance = crossWindowInstance;
    // Define default styles for the debug window boxes
    this.defaultWindowBoxStyle = {
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

    // Create and style crossWindowCount
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

    // Create and style currentCrossWindow
    const currentCrossWindow = document.createElement('div');
    currentCrossWindow.id = 'currentCrossWindow';

    let crossWindowIdSpan = document.createElement('span');
    crossWindowIdSpan.id = 'crossWindowId';
    crossWindowIdSpan.style.backgroundColor = '#fff';
    crossWindowIdSpan.style.height = '20px';
    crossWindowIdSpan.style.fontWeight = 'bold';
    crossWindowIdSpan.style.width = '100%';
    crossWindowIdSpan.style.color = 'black';
    crossWindowIdSpan.style.padding = '5px';
    crossWindowIdSpan.fontSize = '1.5em';
    currentCrossWindow.appendChild(crossWindowIdSpan);
    let br = document.createElement('br');
    currentCrossWindow.appendChild(br);
    let crossWindowPositionSpan = document.createElement('span');
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

  updateUI() {
    setInterval(() => {
      const currentWindows = crosswindow.getCurrentWindows();
      document.getElementById('crossWindowCountValue').innerText = Object.keys(currentWindows).length;
      document.getElementById('crossWindowId').innerText = crosswindow.windowId.split('-')[1];
      document.getElementById('crossWindowPosition').innerText = `x: ${window.screenX}, y: ${window.screenY}`;

      // for each window updateOrCreateDebugContainer
      for (const windowId in currentWindows) {
        currentWindows[windowId].windowId = windowId;
        this.updateOrCreateDebugContainer(currentWindows[windowId]);
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

      // Apply the default window box styles
      Object.assign(windowBox.style, this.defaultWindowBoxStyle);
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

    const adjustedPosition = calculateAdjustedPosition(currentWindowMetadata);

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


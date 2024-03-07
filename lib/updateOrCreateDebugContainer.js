export default function updateOrCreateDebugContainer(currentWindowMetadata) {
  const container = document.getElementById('windowsContainer');
  const boxId = 'windowBox_' + currentWindowMetadata.windowId;
  let windowBox = document.getElementById(boxId);

  if (!windowBox) {
    windowBox = document.createElement('div');
    windowBox.id = boxId;
    windowBox.style.textAlign = 'center';
    windowBox.classList.add('debug-window-box'); // Use CSS class for styling

  
    let windowIdSpan = document.createElement('span');
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


  const adjustedPosition = calculateAdjustedPosition(currentWindowMetadata);

  //console.log(currentWindowMetadata.windowId, this.windowId) 
  if (currentWindowMetadata.windowId === this.windowId) {
    // center the box always its our own
    //console.log("SEESESESESE")
    adjustedPosition.x = window.innerWidth / 2 - 55;
    adjustedPosition.y = window.innerHeight / 2 - adjustedPosition.height / 2 - 200;
    //windowBox.style.transform = 'translate(-50%, -50%)';
  }


  windowBox.style.left = `${adjustedPosition.x}px`;
  windowBox.style.top = `${adjustedPosition.y}px`;



  updatePositionInfo(windowBox, adjustedPosition, currentWindowMetadata);
}

function calculateAdjustedPosition(currentWindowMetadata) {
  const scaleFactor = 0.2; // Adjust scale factor as needed
  const buffer = 16; // Buffer to avoid edge sticking
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let { width, height } = currentWindowMetadata.metadata.size;

  width *= scaleFactor;
  height *= scaleFactor;

  // Calculate relative position
  let x = currentWindowMetadata.metadata.position.x - window.screenX + (width / 2);
  let y = currentWindowMetadata.metadata.position.y - window.screenY + (height / 2);

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

export default function updateOrCreateDebugContainer(currentWindowMetadata) {
  // Container where the boxes will be placed, assumed to fill the entire viewport
  const container = document.getElementById('windowsContainer');

  // Create an ID for the box element based on the windowId
  const boxId = 'windowBox_' + currentWindowMetadata.windowId;

  // Try to find an existing box for this window
  let windowBox = document.getElementById(boxId);

  // If no box exists for this window, create one
  if (!windowBox) {
    windowBox = document.createElement('div');
    windowBox.id = boxId; // Set the ID for future reference
    windowBox.style.textAlign = 'center';

    // add a text span with windowId
    let windowIdSpan = document.createElement('span');
    windowIdSpan.textContent = currentWindowMetadata.windowId.split('-')[1];
    // medium sized white font
    windowIdSpan.style.fontSize = '24px';
    windowIdSpan.style.color = 'red';
    windowBox.appendChild(windowIdSpan);


    container.appendChild(windowBox); // Add the new box to the container
  }


  // console.log('setting post', currentWindowMetadata.metadata.position);
  // Set CSS styles to position and size the box
  windowBox.style.position = 'absolute';


  // Calculate adjusted position based on current window's position to make it relative
  let adjustedPosition = {
    x: currentWindowMetadata.metadata.position.x - window.screenX,
    y: currentWindowMetadata.metadata.position.y - window.screenY
  };


  let otherWindowSize = currentWindowMetadata.metadata.size;

  // Adjust for the center of the current window's viewport
  adjustedPosition.x += (otherWindowSize.width / 2);
  adjustedPosition.y += (otherWindowSize.height / 2);

  // Ensure the boxes stay within the viewport by clamping their positions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxLeft = viewportWidth - 100; // Minimum size to keep the box visible
  const maxTop = viewportHeight - 50; // Minimum size to keep the box visible

  // Clamp the position to ensure the box stays within the viewport
  adjustedPosition.x = Math.min(Math.max(adjustedPosition.x, 0), maxLeft);
  adjustedPosition.y = Math.min(Math.max(adjustedPosition.y, 0), maxTop);

  let scaleFactor = 0.2; // Example scale factor (20%)

  adjustedPosition.x -= (otherWindowSize.width * scaleFactor) / 2;
  adjustedPosition.y -= (otherWindowSize.height * scaleFactor) / 2;

  windowBox.style.left = adjustedPosition.x + 'px';
  windowBox.style.top = adjustedPosition.y + 'px';

  // Calculate a relative window size based on scale of current window * size of other window
  windowBox.style.width = (otherWindowSize.width * scaleFactor) + 'px';
  windowBox.style.height = (otherWindowSize.height * scaleFactor) + 'px';

  windowBox.style.border = '2px solid white';
  windowBox.style.boxSizing = 'border-box';
  windowBox.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'; // Semi-transparent background


  let absoluteOtherWindowPosition = {
    x: currentWindowMetadata.metadata.position.x,
    y: currentWindowMetadata.metadata.position.y
  };
  let absouteCurrentWindowPosition = {
    x: window.screenX,
    y: window.screenY
  };
  // Calculate the absolute distance from the current window
  //let distance = Math.sqrt(Math.pow(adjustedPosition.x, 2) + Math.pow(adjustedPosition.y, 2));
  let distance = Math.sqrt(Math.pow(absoluteOtherWindowPosition.x - absouteCurrentWindowPosition.x, 2) + Math.pow(absoluteOtherWindowPosition.y - absouteCurrentWindowPosition.y, 2));
  distance = Math.round(distance); // Round the distance for better readability

  // Check if the position and distance info span already exists, if not create one
  let positionInfoSpan = windowBox.querySelector('.position-info');
  if (!positionInfoSpan) {
    positionInfoSpan = document.createElement('span');
    positionInfoSpan.className = 'position-info'; // Add a class for potential styling
    positionInfoSpan.style.display = 'block'; // Ensure it appears on a new line
    positionInfoSpan.style.fontSize = '20px';
    positionInfoSpan.style.color = 'white';
    positionInfoSpan.style.textAlign = 'center';
    windowBox.appendChild(positionInfoSpan);
  }

  // Update the position and distance text
  positionInfoSpan.innerHTML = `X: ${adjustedPosition.x.toFixed(0)} <br/> Y: ${adjustedPosition.y.toFixed(0)} <br/> Dist: ${distance}px`;

}

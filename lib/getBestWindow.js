// TODO: refactor this file a bit and split into multiple files with classes
// Remark: We'll need more advanced logic for window layout and positioning ( cascadee / tile / grid / etc )
function calculateEntryPosition(direction, position, bestWindowId, zoomScale = 1) {

  // get the latest metadata about bestWindowId from localStorage
  const allWindowsMetadata = JSON.parse(localStorage.getItem('windowMetadata')) || {};
  const bestWindowMetadata = allWindowsMetadata[bestWindowId];
  if (!bestWindowMetadata) {
    console.error('calculateEntryPosition: bestWindowMetadata not found for windowId', bestWindowId);
    return;
  }

  let bestWindowSize = bestWindowMetadata.size;
  let bestWindowPosition = bestWindowMetadata.position;
  // we need to determine if the calculated position is outside the bounds of the bestWindow
  // if it is, we need to clamp the value to the edge of the window
  // we are working with world coordinates at zoom scale value 1
  // so we can calculate the world coordinates of the window edges by using
  // the window position and size
  let gameWidth = bestWindowSize.width / 2;
  let gameHeight = bestWindowSize.height / 2;


  gameWidth = gameWidth * zoomScale;
  gameHeight = gameHeight * zoomScale;

  //console.log('bestWindowPosition', bestWindowPosition)
  //console.log('bestWindowSize', bestWindowSize)

  // Adjust this buffer size as needed
  const buffer = 44; // any small values should work, without buffer the entity may get stuck in teleportation loop
  // console.log('calculateEntryPosition', direction, position)

  switch (direction) {
    case 'E':
    case 'NE':
    case 'SE':
      position.x = (-gameWidth / 2) + buffer;
      break;
    case 'W':
    case 'SW':
    case 'NW':
      position.x = (gameWidth / 2) - buffer;
      break;
    case 'N':
      position.y = (gameHeight / 2) - buffer;
      break;
    case 'S':
      position.y = (-gameHeight / 2) + buffer;
      break;
  }

  return position;

}

function calculateDistance(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function determineCardinalDirection(screenPosition) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Calculate the differences between the screen position and the center
  const diffX = Math.abs(screenPosition.x - centerX);
  const diffY = Math.abs(screenPosition.y - centerY);

  // Determine the predominant direction based on the larger difference
  if (diffX > diffY) {
    // Horizontal movement is predominant
    return screenPosition.x < centerX ? 'W' : 'E'; // West or East
  } else {
    // Vertical movement is predominant, or equal to horizontal movement
    return screenPosition.y < centerY ? 'N' : 'S'; // North or South
  }
}

export default function getBestWindow(entityData, zoomScale = 1) {
  // TODO: entityData.position? we need an API semantic here for .position and .screenPosition
  const direction = determineCardinalDirection(entityData.screenPosition);
  const allWindowsMetadata = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};

  if (Object.keys(allWindowsMetadata).length === 0) {
    game.flashMessage('no other windows found');
    return;
  }

  const currentWindowPosition = getCurrentWindowPosition();
  const currentWindowSize = getCurrentWindowSize();

  let bestWindowId = null;
  let minEdgeDistance = Infinity;
  let fallbackWindowId = null;
  let minFallbackDistance = Infinity;

  Object.entries(allWindowsMetadata).forEach(([windowId, metadata]) => {

    if (windowId !== this.windowId) {
      const edgeDistance = calculateEdgeDistance(
        direction,
        metadata.position,
        metadata.size,
        currentWindowPosition,
        currentWindowSize
      );

      if (direction === 'E' && metadata.position.x > currentWindowPosition.x) {
        // Consider windows to the right for East direction
        if (edgeDistance < minEdgeDistance) {
          minEdgeDistance = edgeDistance;
          bestWindowId = windowId;
        }
      } else if (direction === 'W' && metadata.position.x < currentWindowPosition.x) {
        // Consider windows to the left for West direction
        if (edgeDistance < minEdgeDistance) {
          minEdgeDistance = edgeDistance;
          bestWindowId = windowId;
        }
      } // Add similar checks for 'N' and 'S' directions if needed
      else if (direction === 'N' && metadata.position.y < currentWindowPosition.y) {
        // Consider windows to the left for West direction
        if (edgeDistance < minEdgeDistance) {
          minEdgeDistance = edgeDistance;
          bestWindowId = windowId;
        }
      } else if (direction === 'S' && metadata.position.y > currentWindowPosition.y) {
        // Consider windows to the left for West direction
        if (edgeDistance < minEdgeDistance) {
          minEdgeDistance = edgeDistance;
          bestWindowId = windowId;
        }
      }
      // Fallback for when no window is found in the preferred direction
      if (edgeDistance < minFallbackDistance) {
        minFallbackDistance = edgeDistance;
        fallbackWindowId = windowId;
      }
    }
  });

  // If no suitable window is found in the preferred direction, use the fallback
  if (!bestWindowId && fallbackWindowId) {
    bestWindowId = fallbackWindowId;
  }


  if (!bestWindowId) {
    bestWindowId = this.windowId;
  }

  // TODO: we can refactor this code to take up less space, incorporate with above loop
  if (bestWindowId === this.windowId && Object.keys(allWindowsMetadata).length > 1) {
    // If the best window is the current window and there are other windows available,
    // pick the first other window as the best window. This is a basic fallback.

    // Remove the current window from consideration
    delete allWindowsMetadata[this.windowId];

    // Reset minEdgeDistance for the new comparison
    minEdgeDistance = Infinity;

    // Iterate through the remaining windows to find the closest one
    Object.entries(allWindowsMetadata).forEach(([windowId, metadata]) => {
      const edgeDistance = calculateEdgeDistance(
        direction,
        metadata.position,
        metadata.size,
        currentWindowPosition,
        currentWindowSize
      );

      // Update bestWindowId if a closer window is found
      if (edgeDistance < minEdgeDistance) {
        minEdgeDistance = edgeDistance;
        bestWindowId = windowId;
      }
    });
  }

  return prepareBestWindowResponse(this, bestWindowId, direction, entityData, zoomScale);
}

// Helper function to get the current window's position
// Implement this based on how you track window positions in your application
function getCurrentWindowPosition() {
  // Example return value
  return { x: window.screenX, y: window.screenY };
}

// Helper function to get the current window's size
function getCurrentWindowSize() {
  // Example return value
  return { width: window.innerWidth, height: window.innerHeight };
}

function calculateEdgeDistance(direction, targetWindowPosition, targetWindowSize, currentWindowPosition, currentWindowSize) {
  let edgeDistance;
  // console.log('calculateEdgeDistance', direction, targetWindowPosition, targetWindowSize, currentWindowPosition, currentWindowSize)
  switch (direction) {
    case 'E':
      // Entity is moving East, so we calculate the distance from the current window's right edge to the target window's left edge
      edgeDistance = targetWindowPosition.x - (currentWindowPosition.x + currentWindowSize.width);
      break;
    case 'W':
      // Entity is moving West, so we calculate the distance from the current window's left edge to the target window's right edge
      edgeDistance = currentWindowPosition.x - (targetWindowPosition.x + targetWindowSize.width);
      break;
    case 'N':
      // Entity is moving North, so we calculate the distance from the current window's top edge to the target window's bottom edge
      edgeDistance = currentWindowPosition.y - (targetWindowPosition.y + targetWindowSize.height);
      break;
    case 'S':
      // Entity is moving South, so we calculate the distance from the current window's bottom edge to the target window's top edge
      edgeDistance = targetWindowPosition.y - (currentWindowPosition.y + currentWindowSize.height);
      break;
    // Handle diagonal directions if needed by combining logic for horizontal and vertical edges
    // e.g., for NE, use the logic from N and E to find the shortest edge distance
    default:
      edgeDistance = Infinity; // Default case to handle unexpected directions
      break;
  }

  // console.log('calcuate distance', edgeDistance, direction, targetWindowPosition, targetWindowSize, currentWindowPosition, currentWindowSize)

  return edgeDistance;
}

function prepareBestWindowResponse(cw, bestWindowId, direction, entityData, zoomScale = 1) {
  return {
    windowId: bestWindowId,
    direction: direction,
    entryPosition: calculateEntryPosition(direction, entityData.position, bestWindowId, zoomScale),
    postMessage: (data) => {
      //console.log('previous position in window', entityData.position)
      const newEntryPosition = calculateEntryPosition(direction, data.position, bestWindowId, zoomScale);
      //console.log('newly calcualted position in window', newEntryPosition)
      data.position = newEntryPosition;
      data.direction = direction;
      data.targetWindowId = bestWindowId;
      cw.communicationManager.sendMessage(data);
    }
  };
}
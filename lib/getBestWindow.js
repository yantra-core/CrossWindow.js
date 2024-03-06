function calculateEntryPosition(direction, position) {
  const buffer = 100; // Adjust this buffer size as needed
  // console.log('calculateEntryPosition', direction, position)
  // current 

  // Invert x or y based on the direction and add a buffer to avoid edge sticking
  switch (direction) {
    case 'E':
    case 'NE':
    case 'SE':
      //position.x = -(position.x + buffer); // Move a bit further from the West edge
      position.x = (-position.x + buffer); // Move a bit further from the West edge
      break;
    case 'W':
    case 'SW':
    case 'NW':
      position.x = (-position.x - buffer); // Move a bit further from the East edge
      break;
    case 'N':
      position.y = (position.y - buffer); // Move a bit further from the South edge
      break;
    case 'S':
      position.y = -(position.y - buffer); // Move a bit further from the North edge
      break;
      // For diagonal directions, invert both x and y and apply the buffer
      //position.x = -(position.x + (direction.includes('E') ? buffer : -buffer));
      //position.y = -(position.y + (direction.includes('S') ? buffer : -buffer));
      break;
  }
  // console.log("b pos", position)
  position = {
    x: 50,
    y: position.y
  };

  /*
  */
  //console.log('calculated', position)

  return position;
}

function calculateDistance(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}


function determineCardinalDirection(screenPosition) {
  // Use the screenPosition to determine the cardinal direction
  // This could be a simple check of x and y coordinates relative to the center of the screen
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  if (screenPosition.x < centerX) return 'W';
  if (screenPosition.x >= centerX) return 'E';
  if (screenPosition.y < centerY) return 'N';
  if (screenPosition.y >= centerY) return 'S';


  if (screenPosition.x < centerX && screenPosition.y < centerY) return 'NW';
  if (screenPosition.x >= centerX && screenPosition.y < centerY) return 'NE';
  if (screenPosition.x >= centerX && screenPosition.y >= centerY) return 'SE';
  if (screenPosition.x < centerX && screenPosition.y >= centerY) return 'SW';

  // Add more granular direction checks if needed
}

export default function getBestWindow(entityData) {
  const direction = determineCardinalDirection(entityData.screenPosition);
  const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};

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
    game.flashMessage('could not find any windows');
    return;
  }

  return prepareBestWindowResponse(this, bestWindowId, direction, entityData);
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

function prepareBestWindowResponse(cw, bestWindowId, direction, entityData) {
  return {
    windowId: bestWindowId,
    direction: direction,
    entryPosition: calculateEntryPosition(direction, entityData.position),
    postMessage: (data) => {
      const newEntryPosition = calculateEntryPosition(direction, data.position);
      data.position = newEntryPosition;
      data.direction = direction;

      cw.communicationManager.sendMessage(bestWindowId, data);
    }
  };
}
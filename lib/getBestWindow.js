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
  const buffer = 40; // any small values should work, without buffer the entity may get stuck in teleportation loop
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

function determineCardinalDirection(entityData) {


  if (entityData.direction) {
    return entityData.direction;
  }

  const screenPosition = entityData.screenPosition;

  // Window's screen position and size to determine the edges
  const windowLeft = window.screenX;
  const windowRight = window.screenX + window.outerWidth;
  const windowTop = window.screenY;
  const windowBottom = window.screenY + window.outerHeight;

  // Differences to the window edges
  const diffToLeft = screenPosition.x - windowLeft;
  const diffToRight = windowRight - screenPosition.x;
  const diffToTop = screenPosition.y - windowTop;
  const diffToBottom = windowBottom - screenPosition.y;

  // Total differences for horizontal and vertical directions
  //const totalHorizontalDiff = diffToLeft + diffToRight;
  //const totalVerticalDiff = diffToTop + diffToBottom;

  // Compare all the diffs and see which is the smallest
  // and return the direction
  if (diffToLeft < diffToRight && diffToLeft < diffToTop && diffToLeft < diffToBottom) {
    return 'W';
  } else if (diffToRight < diffToLeft && diffToRight < diffToTop && diffToRight < diffToBottom) {
    return 'E';
  } else if (diffToTop < diffToLeft && diffToTop < diffToRight && diffToTop < diffToBottom) {
    return 'N';
  } else if (diffToBottom < diffToLeft && diffToBottom < diffToRight && diffToBottom < diffToTop) {
    return 'S';
  }
  
}

export default function getBestWindow(entityData, zoomScale = 1) {
  // TODO: entityData.position? we need an API semantic here for .position and .screenPosition
  //console.log('calling getBestWindow.determineCardinalDirection', entityData)
  const direction = determineCardinalDirection(entityData);
  //console.log('got back direction', direction)
  const allWindowsMetadata = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};

  const currentWindowPosition = getCurrentWindowPosition();
  const currentWindowSize = getCurrentWindowSize();

  let bestWindowId = null;
  let minEdgeDistance = Infinity;
  let fallbackWindowId = null;
  let minFallbackDistance = Infinity;


  if (Object.keys(allWindowsMetadata).length === 0) {
    bestWindowId = this.windowId;
  }

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

  // check to see if there were other windows available but found none, if so pick any that is not current
  // Remark: This case should not happen, but was needed. we'll be able to remove this after adding tests
  if (!bestWindowId && Object.keys(allWindowsMetadata).length > 1) {
    // Remove the current window from consideration
    delete allWindowsMetadata[this.windowId];
    let newKeys = Object.keys(allWindowsMetadata);
    bestWindowId = newKeys[0];
  }

  if (!bestWindowId) {
    bestWindowId = this.windowId;
  }

  // console.log('bestWindowId', bestWindowId, 'direction', direction, 'entityData', entityData, 'zoomScale', zoomScale)

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

      // console.log('will not prefer self using other', bestWindowId, 'direction', direction, 'entityData', entityData, 'zoomScale', zoomScale)

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
      // console.log('previous position in window', data.position)
      if (typeof data.position === 'undefined') {
        data.position = { x: 0, y: 0, z: 0 }; // default position if none provided
      }
      const newEntryPosition = calculateEntryPosition(direction, data.position, bestWindowId, zoomScale);
      //console.log('newly calculated position in window', newEntryPosition)
      data.position = newEntryPosition;
      data.direction = direction;
      data.targetWindowId = bestWindowId;
      cw.communicationManager.sendMessage(data);
    }
  };
}
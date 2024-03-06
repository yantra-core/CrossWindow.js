
function calculateEntryPosition(direction, position) {
  // TODO: Implement logic to calculate the entry position based on the exit direction and position
  position.x = -100;
  position.y = 0;
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

  if (screenPosition.x < centerX && screenPosition.y < centerY) return 'NW';
  if (screenPosition.x >= centerX && screenPosition.y < centerY) return 'NE';
  if (screenPosition.x >= centerX && screenPosition.y >= centerY) return 'SE';
  if (screenPosition.x < centerX && screenPosition.y >= centerY) return 'SW';
  // Add more granular direction checks if needed
}


export default function getBestWindow(entityData) {
  const direction = determineCardinalDirection(entityData.screenPosition);
  const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
  console.log('getBestWindowgetBestWindow', entityData, direction, allWindowsMetadata, this.windowId);
  if (Object.keys(allWindowsMetadata).length === 0) {
    //alert('no other windows found');
    game.flashMessage('no other windows found')
  }

  let bestWindowId = null;
  let minDistance = Infinity;
  //game.flashMessage(Object.keys(allWindowsMetadata).length)
  Object.entries(allWindowsMetadata).forEach(([windowId, metadata]) => {
    bestWindowId = windowId; // for now
    if (windowId !== this.windowId) { // Skip the current window
      const distance = calculateDistance(entityData.screenPosition, metadata.position);
      if (distance < minDistance) {
        minDistance = distance;
        bestWindowId = windowId;
      }
    }
  });

  if (bestWindowId) {
    // Return a window object with a .postMessage() method for the existing best window
    return {
      postMessage: (data) => {
        console.log('calling internal bestWindow.postMessage', bestWindowId, data);

        // Calculate the entry position based on the exit direction and position
        const newEntryPosition = calculateEntryPosition(direction, data.position);
        data.position = newEntryPosition;
        console.log("SENDING NEW POST", data)

        this.communicationManager.sendMessage(bestWindowId, data);
        /*
        this.communicationManager.channel.postMessage({
          action: 'sendMessage',
          targetWindowId: bestWindowId,
          payload: data
        });
        */
      }
    };
  }
  else {
    game.flashMessage('could not find any windows');
    // Remark: Disabled auto-opening windows ( for now )
    return;
    // No suitable window found, create a new one and return a window object for it
    const newWindow = this.open('new_window_url.html', this.calculateWindowFeaturesForDirection(direction)); // Adjust URL and options as needed
    if (newWindow) {
      return {
        postMessage: (message) => {
          this.channel.postMessage({
            action: 'sendMessage',
            // TODO: needs id? or auto-register?
            targetWindowId: this.generateWindowId(), // Assuming new window gets a new ID
            payload: data
          });
        }
      };
    }
  }
}

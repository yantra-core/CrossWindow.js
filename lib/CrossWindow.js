// CrossWindow.js - Marak Squires 2024
// A class to manage communication and entity movement between multiple windows
// Supports opening new windows, sending messages, and teleporting entities between windows
// Also supports detecting and handling window intersections
export default class CrossWindow {
  constructor(game, metadataKey = 'windowMetadata') {
    this.game = game;
    this.metadataKey = metadataKey;
    this.windowId = this.generateWindowId();
    this.channel = new BroadcastChannel('crosswindow_channel');
    this.events = {}; // Object to hold event callbacks
    this.setupListeners();
    this.registerWindow();
    this.startMetadataPolling();
  }

  generateWindowId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  startMetadataPolling() {
    this.prevMetadata = this.getWindowMetadata();
    setInterval(() => {
      const currentMetadata = this.getWindowMetadata();
      if (this.hasMetadataChanged(this.prevMetadata, currentMetadata)) {
        this.updateWindowMetadata(currentMetadata);
        this.checkForIntersections(currentMetadata);
      }
    }, 100); // Poll every 100ms
  }

  getWindowMetadata() {
    return {
      position: { x: window.screenX, y: window.screenY },
      size: { width: window.innerWidth, height: window.innerHeight }
    };
  }

  hasMetadataChanged(prevMetadata, currentMetadata) {
    return prevMetadata.position.x !== currentMetadata.position.x ||
      prevMetadata.position.y !== currentMetadata.position.y ||
      prevMetadata.size.width !== currentMetadata.size.width ||
      prevMetadata.size.height !== currentMetadata.size.height;
  }

  updateWindowMetadata(metadata) {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    allWindowsMetadata[this.windowId] = metadata;
    localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
    this.prevMetadata = metadata;
  }

  checkForIntersections(currentMetadata) {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    Object.entries(allWindowsMetadata).forEach(([windowId, metadata]) => {
      if (windowId !== this.windowId && this.isOverlapping(currentMetadata, metadata)) {
        // Emit an 'intersecting' event to the overlapping window
        this.emitIntersectionEvent(windowId, this.calculateIntersection(currentMetadata, metadata));
      }
    });
  }

  isOverlapping(metadata1, metadata2) {
    return !(metadata2.position.x >= metadata1.position.x + metadata1.size.width ||
      metadata2.position.x + metadata2.size.width <= metadata1.position.x ||
      metadata2.position.y >= metadata1.position.y + metadata1.size.height ||
      metadata2.position.y + metadata2.size.height <= metadata1.position.y);
  }

  calculateIntersection(metadata1, metadata2) {
    const x1 = Math.max(metadata1.position.x, metadata2.position.x);
    const y1 = Math.max(metadata1.position.y, metadata2.position.y);
    const x2 = Math.min(metadata1.position.x + metadata1.size.width, metadata2.position.x + metadata2.size.width);
    const y2 = Math.min(metadata1.position.y + metadata1.size.height, metadata2.position.y + metadata2.size.height);

    return {
      position: { x: x1, y: y1 },
      size: { width: x2 - x1, height: y2 - y1 }
    };
  }

  emitIntersectionEvent(targetWindowId, intersectionArea) {
    // console.log('postMessage intersecting', targetWindowId, intersectionArea)
    this.channel.postMessage({
      action: 'intersecting',
      sourceWindowId: this.windowId,
      targetWindowId: targetWindowId,
      intersectionArea: intersectionArea
    });
  }

  sendMessage(targetWindowId, message) {
    // Include both the target window ID and the message payload
    console.log('postMessage message', targetWindowId, message)
    this.channel.postMessage({
      action: 'sendMessage',
      targetWindowId: targetWindowId,
      payload: message
    });
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  emit(eventName, data) {
    const callbacks = this.events[eventName];
    if (callbacks) {
      callbacks.forEach(callback => {
        callback(data);
      });
    }
  }

  handleDirectMessage(data) {
    // Implement handling of the direct message payload here
    // This could involve creating entities, updating the game state, etc., based on the message content
    console.log('Received direct message:', data);
    this.emit('message', data);
  }

  open(url, options = {}, adjustCurrentWindow = false) {
    // Check if URL is provided
    if (!url) {
      console.error('URL is required to open a new window.');
      return;
    }

    // Default window features
    const defaultFeatures = {
      width: 600, // Default width
      height: 400, // Default height
      menubar: 'no',
      toolbar: 'no',
      location: 'no',
      status: 'no',
      scrollbars: 'yes',
      resizable: 'yes',
      title: new Date().toISOString(), // Default title
      top: window.screenY + 100, // Default top position
      left: window.screenX + 100 // Default left position
    };

    // Merge default features with custom options
    const features = { ...defaultFeatures, ...options };

    // If adjustCurrentWindow is true, resize and reposition the current window
    if (adjustCurrentWindow) {
      window.resizeTo(window.outerWidth / 2, window.outerHeight / 2);
      window.moveTo(features.left, features.top);
      // Adjust new window's size to fill the empty space
      features.width = window.outerWidth;
      features.height = window.outerHeight;
    }

    // Convert features object to a comma-separated string
    const featuresStr = Object.entries(features).map(([key, value]) => `${key}=${value}`).join(',');

    // Open a new window with the specified URL, name, and configured features
    const newWindow = window.open(url, features.title, featuresStr);

    if (newWindow) {
      // If adjustCurrentWindow is true, position the new window to fill the empty space
      if (adjustCurrentWindow) {
        newWindow.moveTo(window.screenX + window.outerWidth, window.screenY);
      }
      // Return the reference to the new window for further use
      return newWindow;
    } else {
      console.error('Failed to open a new window. Please check browser popup settings.');
    }
  }

  registerWindow() {
    this.updateWindowMetadata();
    this.pingOtherWindows();
  }

  pingOtherWindows() {
    // Broadcast a ping message to all windows
    this.channel.postMessage({ action: 'ping', sourceWindowId: this.windowId });

    // Set a timeout to check for windows that haven't responded
    setTimeout(() => {
      this.removeInactiveWindows();
    }, 5000); // Adjust the timeout duration as needed
  }

  setupListeners() {
    this.channel.onmessage = (event) => {
      const data = event.data;
      // Handle incoming messages
      if (data.action === 'createEntity' && data.entities) {
        data.entities.forEach(entity => this.game.createEntity(entity));
      } else if (data.action === 'ping' && data.sourceWindowId !== this.windowId) {
        // Respond to ping with pong
        this.channel.postMessage({ action: 'pong', sourceWindowId: this.windowId });
      } else if (data.action === 'pong' && data.sourceWindowId !== this.windowId) {
        // Mark the window as active
        this.markWindowAsActive(data.sourceWindowId);
      } else if (data.action === 'sendMessage' && data.targetWindowId === this.windowId) {
        this.handleDirectMessage(data);
      } else if (data.action === 'intersecting' && data.sourceWindowId !== this.windowId) {
        // Handle intersection event
        this.emit('message', data);
      }
    };
  }

  markWindowAsActive(windowId) {
    // Update the lastActive timestamp for the window in localStorage
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    if (allWindowsMetadata[windowId]) {
      allWindowsMetadata[windowId].lastActive = Date.now();
      localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
    }
  }

  removeInactiveWindows() {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    const currentTime = Date.now();
    Object.entries(allWindowsMetadata).forEach(([windowId, metadata]) => {
      // Consider a window inactive if it hasn't responded to the ping within the timeout
      if (currentTime - metadata.lastActive > 5000) { // 5-second timeout
        delete allWindowsMetadata[windowId];
      }
    });
    localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
  }

  updateWindowMetadata() {
    const metadata = {
      position: { x: window.screenX, y: window.screenY },
      size: { width: window.innerWidth, height: window.innerHeight },
      lastActive: Date.now()
    };
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    allWindowsMetadata[this.windowId] = metadata;
    localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
  }

  teleportEntities(entityIds, targetWindowId) {
    const entitiesToTeleport = this.game.entities.filter(entity => entityIds.includes(entity.id));
    if (entitiesToTeleport.length > 0) {
      this.channel.postMessage({
        action: 'createEntity',
        targetWindowId: targetWindowId,
        entities: entitiesToTeleport
      });
    }
  }

  deregisterWindow() {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    delete allWindowsMetadata[this.windowId];
    localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
    // Optionally, broadcast deregistration if needed for cleanup in other windows
  }

  getBestWindow(entityData) {
    const direction = this.determineCardinalDirection(entityData.screenPosition);
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};

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
        const distance = this.calculateDistance(entityData.screenPosition, metadata.position);
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
          const newEntryPosition = this.calculateEntryPosition(direction, data.position);
          data.position = newEntryPosition;
          console.log("SENDING NEW POST", data)
          this.channel.postMessage({
            action: 'sendMessage',
            targetWindowId: bestWindowId,
            payload: data
          });
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

  calculateEntryPosition(direction, position) {
    // TODO: Implement logic to calculate the entry position based on the exit direction and position
    position.x = -100;
    position.y = 0;
    return position;
  }

  calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }


  determineCardinalDirection(screenPosition) {
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

  calculateWindowFeaturesForDirection(direction) {
    // Implement logic to calculate window features (position, size) based on the exit direction
    // Return an object with properties suitable for the 'open' method
  }

}
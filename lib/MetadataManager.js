export default class MetadataManager {
  constructor(cw) {
    this.cw = cw;
    this.config = cw.config;
    this.windowId = cw.windowId;
    this.emit = cw.emit.bind(cw);
    this.currentWindows = {};
  }

  getCurrentWindows() {

    let active = {};
    // for each non-null currentWindows
    Object.keys(this.currentWindows).forEach(windowId => {
      if (this.currentWindows[windowId]) {
        active[windowId] = this.currentWindows[windowId];
      }
    });
    return active;
  }

  // Method to abstract the window object creation logic
  createWindowObject(key, metadata) {
    let _window = {};

    // Define the postMessage function with scoped data
    _window.postMessage = (data) => {
      // Ensure the data object includes the necessary properties
      data.targetWindowId = key; // Use the key as the window ID
      data.sourceWindowId = this.cw.windowId;
      // console.log('sending meta', data);
      data.action = 'message';

      // Send the message through the communication manager
      this.cw.communicationManager.sendMessage(data);
    };

    // Assign the window ID and metadata
    _window.windowId = key;
    _window.metadata = metadata;

    return _window;
  }

  getWindows() {
    const windowsMetadata = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};
    // console.log('windowsMetadata', windowsMetadata);

    const windows = Object.keys(windowsMetadata).reduce((acc, key) => {
      const metadata = windowsMetadata[key];
      const _window = this.createWindowObject(key, metadata);

      // Accumulate the _window object into the acc object, keyed by windowId
      acc[_window.windowId] = _window;

      return acc;
    }, {}); // Initialize acc as an empty object

    // console.log('windows object', windows);
    return windows;
  }

  getWindowById(windowId) {
    const windowsMetadata = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};
    const metadata = windowsMetadata[windowId];

    if (!metadata) {
      console.log(`Window with ID ${windowId} not found.`);
      return null;
    }

    return this.createWindowObject(windowId, metadata);
  }

  startHeartbeat() {
    setInterval(() => {
      this.updateWindowMetadata(); // Update current window's metadata
      this.removeInactiveWindows(200); // milliseconds
    }, 200); // Update every 200ms
  }

  pollWindows() {
    let prevMetadata = this.getWindows(); // Store the initial state of all windows.

    setInterval(() => {
      let allWindows = this.getWindows(); // Fetch the current state of all windows.

      // Check for closed windows by comparing prevMetadata with the current state
      Object.keys(prevMetadata).forEach(windowId => {
        if (windowId === this.windowId) return; // Skip the current window
        if (!allWindows.hasOwnProperty(windowId)) {
          // If a window in prevMetadata is not present in allWindows, it's been closed
          this.emit('windowClosed', { windowId, metadata: prevMetadata[windowId] });
        }
      });

      // Iterate through all current windows to check for changes or new windows
      Object.keys(allWindows).forEach(windowId => {
        const currentWindow = allWindows[windowId];
        const prevWindow = prevMetadata[windowId];

        // Check if the window is new
        if (!prevWindow) {
          let otherWindow = {};

          otherWindow.postMessage = (data) => {
            data.targetWindowId = windowId;
            console.log('sending meta', data)
            data.action = 'message';

            this.cw.communicationManager.sendMessage(data);
          }

          otherWindow.windowId = windowId;
          otherWindow.metadata = currentWindow.metadata;

          // Construct a new crosswindow object with scoped postMessage
          // Emit an event for the new window
          this.emit('windowOpened', otherWindow);
        }

        // Check if the window's metadata has changed
        if (prevWindow && this.hasMetadataChanged(prevWindow.metadata, currentWindow.metadata)) {
          // Emit an event for the changed window
          this.emit('windowChanged', currentWindow);
        }

        // Update the previous metadata state and current windows state for the next iteration
        prevMetadata[windowId] = currentWindow;
        this.currentWindows[windowId] = currentWindow;
      });

      // Update prevMetadata to reflect the current state for the next iteration
      prevMetadata = { ...allWindows };
    }, 15);
  }

  hasMetadataChanged(prevMetadata, currentMetadata) {
    return prevMetadata.position.x !== currentMetadata.position.x ||
      prevMetadata.position.y !== currentMetadata.position.y ||
      prevMetadata.size.width !== currentMetadata.size.width ||
      prevMetadata.size.height !== currentMetadata.size.height;
  }

  getWindowMetadata() {
    return {
      position: { x: window.screenX, y: window.screenY },
      size: { width: window.outerWidth, height: window.outerHeight }
    };
  }

  updateWindowMetadata(metadata = this.getWindowMetadata()) {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};
    allWindowsMetadata[this.windowId] = { ...metadata, lastActive: Date.now() };
    localStorage.setItem(this.config.metadataKey, JSON.stringify(allWindowsMetadata));
  }

  removeInactiveWindows(timeout = 1000) {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};
    const currentTime = Date.now();
    //console.log('removeInactiveWindows', allWindowsMetadata, currentTime, timeout)
    Object.entries(allWindowsMetadata).forEach(([windowId, metadata]) => {
      if (currentTime - metadata.lastActive > timeout) {
        // console.log('removeInactiveWindows', windowId, metadata, currentTime, timeout)
        delete allWindowsMetadata[windowId];
        this.currentWindows[windowId] = null;
      }
    });
    localStorage.setItem(this.config.metadataKey, JSON.stringify(allWindowsMetadata));
  }

  markWindowAsActive(windowId) {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};
    if (allWindowsMetadata[windowId]) {
      allWindowsMetadata[windowId].lastActive = Date.now();
      localStorage.setItem(this.config.metadataKey, JSON.stringify(allWindowsMetadata));
    }
  }

  deregisterWindow() {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};
    delete allWindowsMetadata[this.windowId];
    localStorage.setItem(this.config.metadataKey, JSON.stringify(allWindowsMetadata));
  }
}

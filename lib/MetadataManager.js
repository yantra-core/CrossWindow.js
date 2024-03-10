export default class MetadataManager {
  constructor(cw) {
    this.cw = cw;
    this.config = cw.config;
    this.windowId = cw.windowId;
    this.emit = cw.emit.bind(cw);
    this.currentWindows = {};
  }

  startHeartbeat() {
    setInterval(() => {
      this.updateWindowMetadata(); // Update current window's metadata
      this.removeInactiveWindows(660); // milliseconds
    }, 200); // Update every 200ms
  }

  getCurrentWindows() {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};
    return allWindowsMetadata;
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
    const now = Date.now();

    // Check if the current window's metadata exists or if the incoming update is more recent
    if (!allWindowsMetadata.hasOwnProperty(this.windowId) || now > allWindowsMetadata[this.windowId].lastUpdate) {
      // Update the metadata with the current timestamp and save it
      allWindowsMetadata[this.windowId] = { ...metadata, lastActive: now, lastUpdate: now };
      // console.log('Updating metadata for window:', this.windowId, allWindowsMetadata[this.windowId]);
      localStorage.setItem(this.config.metadataKey, JSON.stringify(allWindowsMetadata));
    } else {
      // console.log(`Skipped update for window ID ${this.windowId} due to older timestamp.`);
    }
  }

  startWindowEventPolling() {
    this.prevMetadata = this.getWindows(); // Initial setup for comparison
  
    setInterval(() => {
      let allWindows = this.getWindows(); // Fetch current state of all windows
  
      // Check for closed windows
      Object.keys(this.prevMetadata).forEach(windowId => {
        if (windowId !== this.windowId && !allWindows.hasOwnProperty(windowId)) {
          this.emit('windowClosed', { windowId, metadata: this.prevMetadata[windowId] });
        }
      });
  
      // Check for new or changed windows
      Object.keys(allWindows).forEach(windowId => {
        const currentWindow = allWindows[windowId];
        const prevWindow = this.prevMetadata[windowId];
  
        if (!prevWindow) {
          this.emit('windowOpened', currentWindow); // Emit event for new window
        } else if (this.hasMetadataChanged(prevWindow.metadata, currentWindow.metadata)) {
          this.emit('windowChanged', currentWindow); // Emit event for changed window
        }
      });
  
      this.prevMetadata = allWindows; // Update for next iteration
    }, 200); // Frequency of polling
  }
  

  removeInactiveWindows(timeout = 1000) {
    let currentWindowsInLocalStorage = JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};

    const currentTime = Date.now();
    //console.log('removeInactiveWindows', allWindowsMetadata, currentTime, timeout)
    Object.entries(currentWindowsInLocalStorage).forEach(([windowId, metadata]) => {
      if (currentTime - metadata.lastActive > timeout) {
        // console.log('removeInactiveWindows', windowId, metadata, currentTime, timeout)
        delete currentWindowsInLocalStorage[windowId];
        this.currentWindows[windowId] = null;
      }
    });
    localStorage.setItem(this.config.metadataKey, JSON.stringify(currentWindowsInLocalStorage));
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

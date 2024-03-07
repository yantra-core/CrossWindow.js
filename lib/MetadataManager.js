export default class MetadataManager {
  constructor(cw) {
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

  getWindows() {
    return JSON.parse(localStorage.getItem(this.config.metadataKey)) || {};
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
        const currentWindowMetadata = allWindows[windowId];
        const prevWindowMetadata = prevMetadata[windowId];
  
        // Check if the window is new
        if (!prevWindowMetadata) {
          // Emit an event for the new window
          this.emit('windowOpened', { windowId, metadata: currentWindowMetadata });
        }
  
        // Check if the window's metadata has changed
        if (prevWindowMetadata && this.hasMetadataChanged(prevWindowMetadata, currentWindowMetadata)) {
          // Emit an event for the changed window
          this.emit('windowChanged', { windowId, metadata: currentWindowMetadata });
        }
  
        // Update the previous metadata state and current windows state for the next iteration
        prevMetadata[windowId] = currentWindowMetadata;
        this.currentWindows[windowId] = currentWindowMetadata;
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

export default class MetadataManager {
  constructor(metadataKey, cw) {
    this.metadataKey = metadataKey;
    this.windowId = cw.windowId;
    this.emit = cw.emit.bind(cw);
  }

  getWindows() {
    return JSON.parse(localStorage.getItem(this.metadataKey)) || {};
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
          console.log('gone', windowId, prevMetadata[windowId])
          this.emit('windowClosed', { windowId, metadata: prevMetadata[windowId] });
        }
      });
  
      // Iterate through all current windows to check for changes or new windows
      Object.keys(allWindows).forEach(windowId => {
        const currentWindowMetadata = allWindows[windowId];
        const prevWindowMetadata = prevMetadata[windowId];
  
        // Check if the window is new or its metadata has changed
        //if (!prevWindowMetadata || this.hasMetadataChanged(prevWindowMetadata, currentWindowMetadata)) {
          // Update the previous metadata state for the next iteration
          prevMetadata[windowId] = currentWindowMetadata;
  
          // Emit an event for the changed or new window
          // TODO: without the conditional statement this is now 'windowHeartbeat'
          // we should split the case and have two events to subscribe to
          this.emit('windowChanged', { windowId, metadata: currentWindowMetadata });
       // }
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
      size: { width: window.innerWidth, height: window.innerHeight }
    };
  }

  updateWindowMetadata(metadata = this.getWindowMetadata()) {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    allWindowsMetadata[this.windowId] = { ...metadata, lastActive: Date.now() };
    localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
  }


  removeInactiveWindows(timeout = 1000) {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    const currentTime = Date.now();
    Object.entries(allWindowsMetadata).forEach(([windowId, metadata]) => {
      if (currentTime - metadata.lastActive > timeout) {
        delete allWindowsMetadata[windowId];
      }
    });
    localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
  }

  markWindowAsActive(windowId) {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    if (allWindowsMetadata[windowId]) {
      allWindowsMetadata[windowId].lastActive = Date.now();
      localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
    }
  }

  deregisterWindow() {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
    delete allWindowsMetadata[this.windowId];
    localStorage.setItem(this.metadataKey, JSON.stringify(allWindowsMetadata));
  }
}

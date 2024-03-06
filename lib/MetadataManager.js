export default class MetadataManager {
  constructor(metadataKey, cw) {
    this.metadataKey = metadataKey;
    this.windowId = cw.windowId;
    this.emit = cw.emit.bind(cw);
  }

  getWindows() {
    return JSON.parse(localStorage.getItem(this.metadataKey)) || {};
  }

  pollWindows() {
    const prevMetadata = this.getWindows(); // This will store the initial state of all windows.
    setInterval(() => {
      let allWindows = this.getWindows(); // Fetch the current state of all windows.
  
      // Iterate through all current windows and compare with previous state.
      Object.keys(allWindows).forEach(windowId => {
        const currentWindowMetadata = allWindows[windowId];
        const prevWindowMetadata = prevMetadata[windowId];
//        console.log('prev pos', prevWindowMetadata.position.x, prevWindowMetadata.position.y)
 //       console.log('current pos', currentWindowMetadata.position.x, currentWindowMetadata.position.y)
        // Check if the metadata for the current window has changed using the hasMetadataChanged function.
        if (!prevWindowMetadata || this.hasMetadataChanged(prevWindowMetadata, currentWindowMetadata)) {
          // Update the previous metadata state for the next iteration.
          prevMetadata[windowId] = currentWindowMetadata;
  
          // Emit an event for the changed window.
          this.emit('windowChanged', { windowId, metadata: currentWindowMetadata });
        }
      });
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

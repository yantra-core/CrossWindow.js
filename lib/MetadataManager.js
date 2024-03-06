export default class MetadataManager {
  constructor(metadataKey, windowId) {
    this.metadataKey = metadataKey;
    this.windowId = windowId;
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

  hasMetadataChanged(prevMetadata, currentMetadata) {
    return prevMetadata.position.x !== currentMetadata.position.x ||
      prevMetadata.position.y !== currentMetadata.position.y ||
      prevMetadata.size.width !== currentMetadata.size.width ||
      prevMetadata.size.height !== currentMetadata.size.height;
  }

  removeInactiveWindows(timeout = 5000) {
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

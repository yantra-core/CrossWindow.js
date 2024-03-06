export default class IntersectionDetector {
  constructor(metadataManager, windowId) {
    this.metadataManager = metadataManager;
    this.windowId = windowId;
    this.prevMetadata = null;
    this.startMetadataPolling();
  }

  startMetadataPolling() {
    this.prevMetadata = this.metadataManager.getWindowMetadata();
    setInterval(() => {
      const currentMetadata = this.metadataManager.getWindowMetadata();
      if (this.metadataManager.hasMetadataChanged(this.prevMetadata, currentMetadata)) {
        this.metadataManager.updateWindowMetadata(currentMetadata);
        this.checkForIntersections(currentMetadata);
      }
    }, 100);
  }

  checkForIntersections(currentMetadata) {
    const allWindowsMetadata = JSON.parse(localStorage.getItem(this.metadataManager.metadataKey)) || {};
    Object.entries(allWindowsMetadata).forEach(([windowId, metadata]) => {
      if (windowId !== this.windowId && this.isOverlapping(currentMetadata, metadata)) {
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
    return { position: { x: x1, y: y1 }, size: { width: x2 - x1, height: y2 - y1 } };
  }

  emitIntersectionEvent(targetWindowId, intersectionArea) {
    const channel = new BroadcastChannel('crosswindow_channel');
    channel.postMessage({
      action: 'intersecting',
      sourceWindowId: this.windowId,
      targetWindowId: targetWindowId,
      intersectionArea: intersectionArea
    });
  }
}
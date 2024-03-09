import EventReceiver from './EventReceiver.js'; // handles keyboard and mouse events

export default class CommunicationManager {
  constructor(channel, cw, notUsed, metadataManager) {
    this.channel = channel;
    this.windowId = cw.windowId;
    this.cw = cw;
    this.metadataManager = metadataManager;

    this.eventReceiver = new EventReceiver(cw);

    this.setupListeners();
    this.startPing();
  }

  setupListeners() {
    this.channel.onmessage = (event) => {
      const data = event.data;
      switch (data.action) {
        case 'ping':
          if (data.sourceWindowId !== this.windowId) this.channel.postMessage({ action: 'pong', sourceWindowId: this.windowId });
          break;
        case 'pong':
          if (data.sourceWindowId !== this.windowId) this.metadataManager.markWindowAsActive(data.sourceWindowId);
          break;
        case 'message':
          if (data.targetWindowId === 'any') this.cw.emit('message', data);
          if (data.targetWindowId === this.windowId) this.cw.emit('message', data);
          break;
        case 'intersecting':
          if (data.sourceWindowId !== this.windowId) this.cw.emit('intersecting', data);
          break;
        case 'keydown':
        case 'keyup':
          // do not repeat own inputs
          if (data.sourceWindowId === this.windowId) {
            return;
          }
          this.eventReceiver.handleKeyboardEvent(data);
          this.cw.emit('keyEvent', data);
          break;
        case 'mouseEvent':
          this.eventReceiver.handleMouseEvent(data);
          this.cw.emit('mouseEvent', data);
          break;

      }
    };
  }

  startPing() {
    setInterval(() => {
      this.channel.postMessage({ action: 'ping', sourceWindowId: this.windowId });
    }, 1000); // Send ping every second
  }

  sendMessage(message) {
    if (message.targetWindowId === this.windowId) {
      this.cw.emit('message', { sourceWindowId: this.windowId, payload: message });
      return;
    }

    // sanitize message to remove functions and possible circular references
    message = JSON.parse(JSON.stringify(message));

    message.sourceWindowId = this.windowId;
    this.channel.postMessage(message);
  }
}
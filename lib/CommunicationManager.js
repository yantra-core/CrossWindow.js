export default class CommunicationManager {
  constructor(channel, cw, game, metadataManager) {
    this.channel = channel;
    this.windowId = cw.windowId;
    this.game = game;
    this.cw = cw;
    this.metadataManager = metadataManager;
    this.setupListeners();
    this.startPing();
  }

  setupListeners() {
    this.channel.onmessage = (event) => {
      const data = event.data;
      switch (data.action) {
        case 'createEntity':
          if (data.entities) data.entities.forEach(entity => this.game.createEntity(entity));
          break;
        case 'ping':
          if (data.sourceWindowId !== this.windowId) this.channel.postMessage({ action: 'pong', sourceWindowId: this.windowId });
          break;
        case 'pong':
          if (data.sourceWindowId !== this.windowId) this.metadataManager.markWindowAsActive(data.sourceWindowId);
          break;
        case 'sendMessage':
          if (data.targetWindowId === this.windowId) this.cw.emit('message', data);
          break;
        case 'intersecting':
          if (data.sourceWindowId !== this.windowId) this.cw.emit('intersecting', data);
          break;
      }
    };
  }

  startPing() {
    setInterval(() => {
      this.channel.postMessage({ action: 'ping', sourceWindowId: this.windowId });
    }, 1000); // Send ping every second
  }

  sendMessage(targetWindowId, message) {
    this.channel.postMessage({
      action: 'sendMessage',
      targetWindowId: targetWindowId,
      payload: message
    });
  }

}
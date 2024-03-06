export default class CommunicationManager {
  constructor(channel, windowId, game, metadataManager) {
    this.channel = channel;
    this.windowId = windowId;
    this.game = game;
    this.metadataManager = metadataManager;
    this.events = {};
    this.setupListeners();
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
          if (data.targetWindowId === this.windowId) this.emit('message', data);
          break;
        case 'intersecting':
          if (data.sourceWindowId !== this.windowId) this.emit('intersecting', data.intersectionArea);
          break;
      }
    };
  }

  sendMessage(targetWindowId, message) {
    this.channel.postMessage({
      action: 'sendMessage',
      targetWindowId: targetWindowId,
      payload: message
    });
  }

  on(eventName, callback) {
    if (!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
  }

  emit(eventName, data) {
    const callbacks = this.events[eventName];
    if (callbacks) callbacks.forEach(callback => callback(data));
  }
}
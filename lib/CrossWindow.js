// CrossWindow.js - Marak Squires 2024
// A class to manage communication and entity movement between multiple windows
// Supports opening new windows, sending messages, and teleporting entities between windows
// Also supports detecting and handling window intersections
import getBestWindow from './getBestWindow.js';
import open from './open.js';

import CommunicationManager from './CommunicationManager.js';
import MetadataManager from './MetadataManager.js';
import IntersectionDetector from './IntersectionDetector.js';

export default class CrossWindow {
  constructor(game, metadataKey = 'windowMetadata') {
    this.game = game;
    this.metadataKey = metadataKey;
    this.windowId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.metadataManager = new MetadataManager(metadataKey, this.windowId);
    this.communicationManager = new CommunicationManager(new BroadcastChannel('crosswindow_channel'), this.windowId, game, this.metadataManager);
    this.intersectionDetector = new IntersectionDetector(this.metadataManager, this.windowId);
    this.on = this.communicationManager.on.bind(this.communicationManager);
    this.emit = this.communicationManager.emit.bind(this.communicationManager);
    this.open = open.bind(this);
    this.getBestWindow = getBestWindow.bind(this);
    this.getWindowMetadata = this.metadataManager.getWindowMetadata.bind(this);
    // this.postMessage = this.communicationManager.sendMessage.bind(this.communicationManager);

    this.registerWindow();
  }

  registerWindow() {
    this.metadataManager.updateWindowMetadata();
    this.pingOtherWindows();
  }

  pingOtherWindows() {
    const channel = new BroadcastChannel('crosswindow_channel');
    channel.postMessage({ action: 'ping', sourceWindowId: this.windowId });
    setTimeout(() => this.metadataManager.removeInactiveWindows(), 5000);
  }

  deregisterWindow() {
    this.metadataManager.deregisterWindow();
  }
}

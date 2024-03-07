// CrossWindow.js - Marak Squires 2024
// A class to manage communication and entity movement between multiple windows
// Supports opening new windows, sending messages, and teleporting entities between windows
// Also supports detecting and handling window intersections
import getBestWindow from './getBestWindow.js';
import open from './open.js';

import CommunicationManager from './CommunicationManager.js';
import MetadataManager from './MetadataManager.js';
import IntersectionDetector from './IntersectionDetector.js';

// The debug containers are optional, but useful for debugging so included with default package
// These could could be separate bundle to further reduce size
import updateOrCreateDebugContainer from './updateOrCreateDebugContainer.js';

export default class CrossWindow {
  constructor(game, metadataKey = 'windowMetadata') {
    this.game = game;
    this.metadataKey = metadataKey;
    this.events = {};
    this.windowId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.metadataManager = new MetadataManager(metadataKey, this);
    this.communicationManager = new CommunicationManager(new BroadcastChannel('crosswindow_channel'), this, game, this.metadataManager);
    //this.on = this.communicationManager.on.bind(this.communicationManager);
    //this.emit = this.communicationManager.emit.bind(this.communicationManager);
    this.intersectionDetector = new IntersectionDetector(this.metadataManager, this.windowId);
    this.open = open.bind(this);
    this.getBestWindow = getBestWindow.bind(this);
    this.getWindows = this.metadataManager.getWindows.bind(this.metadataManager);
    this.getCurrentWindows = this.metadataManager.getCurrentWindows.bind(this.metadataManager);
    this.getWindowMetadata = this.metadataManager.getWindowMetadata.bind(this);
    this.pollWindows = this.metadataManager.pollWindows.bind(this.metadataManager);
    this.postMessage = this.communicationManager.sendMessage.bind(this.communicationManager);
    this.registerWindow();
    this.metadataManager.startHeartbeat();
    this.updateOrCreateDebugContainer = updateOrCreateDebugContainer.bind(this);

  }

  on(eventName, callback) {
    if (!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
  }

  emit(eventName, data) {
    const callbacks = this.events[eventName];
    if (callbacks) callbacks.forEach(callback => callback(data));
  }

  registerWindow() {
    this.metadataManager.updateWindowMetadata();
    this.pingOtherWindows();
  }

  pingOtherWindows() {
    const channel = new BroadcastChannel('crosswindow_channel');
    channel.postMessage({ action: 'ping', sourceWindowId: this.windowId });
    setTimeout(() => this.metadataManager.removeInactiveWindows(), 100);
  }

  deregisterWindow() {
    this.metadataManager.deregisterWindow();
  }
}

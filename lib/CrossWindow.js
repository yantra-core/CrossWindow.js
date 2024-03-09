// CrossWindow.js - Marak Squires 2024
// A class to manage communication and entity movement between multiple windows
// Supports opening new windows, sending messages, and teleporting entities between windows
// Also supports detecting and handling window intersections
import getBestWindow from './getBestWindow.js';
import open from './open.js';

import CommunicationManager from './CommunicationManager.js';
import MetadataManager from './MetadataManager.js';
import IntersectionDetector from './IntersectionDetector.js';

import KeyboardEventBroadcaster from './KeyboardEventBroadcaster.js';
import MouseEventBroadcaster from './MouseEventBroadcaster.js';

export default class CrossWindow {
  constructor(_window, config = {}) {

    // TODO: ensure that no global window scope is used in code, always refer to this.window
    this.window = _window;

    this.config = {};
    this.config.metadataKey = config.metadataKey || 'windowMetadata';

    // Defaults true for broadcasting input events
    this.config.broadcastKeyboardEvents = true;
    this.config.broadcastMouseEvents = true;

    // Override defaults with user config
    if (typeof config.broadcastKeyboardEvents === 'boolean') {
      this.config.broadcastKeyboardEvents = config.broadcastKeyboardEvents;
    }
    if (typeof config.broadcastMouseEvents === 'boolean') {
      this.config.broadcastMouseEvents = config.broadcastMouseEvents;
    }
    
    this.events = {};
    this.windowId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.metadataManager = new MetadataManager(this);
    this.communicationManager = new CommunicationManager(new BroadcastChannel('crosswindow_channel'), this, null, this.metadataManager);
    this.intersectionDetector = new IntersectionDetector(this.metadataManager, this.windowId);

    if (this.config.broadcastKeyboardEvents) {
      this.keyboardEventBroadcaster = new KeyboardEventBroadcaster(this);
    }
    if (this.config.broadcastMouseEvents) {
      this.mouseEventBroadcaster = new MouseEventBroadcaster(this);
    }

    this.open = open.bind(this);
    this.getBestWindow = getBestWindow.bind(this);
    this.getWindows = this.metadataManager.getWindows.bind(this.metadataManager);
    this.getWindowById = this.metadataManager.getWindowById.bind(this.metadataManager);
    this.getCurrentWindows = this.metadataManager.getCurrentWindows.bind(this.metadataManager);
    this.getWindowMetadata = this.metadataManager.getWindowMetadata.bind(this);
    this.pollWindows = this.metadataManager.pollWindows.bind(this.metadataManager);
    this.postMessage = this.communicationManager.sendMessage.bind(this.communicationManager);
    this.registerWindow();
    this.pollWindows();
    this.metadataManager.startHeartbeat();

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
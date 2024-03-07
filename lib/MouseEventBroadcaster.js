export default class MouseEventBroadcaster {
  constructor(crosswindow) {
    this.cw = crosswindow;
    this.initEventListeners();
  }

  initEventListeners() {
    // List of mouse events you want to broadcast
    const mouseEvents = ['click', 'mousedown', 'mouseup', 'mousemove'];
    mouseEvents.forEach((eventType) => {
      window.document.addEventListener(eventType, this.handleMouseEvent.bind(this));
    });
  }

  handleMouseEvent(event) {

    // Return early if event should not be propagated
    if (event.bubbles === false) {
      return;
    }

    if (!this.shouldBroadcastEvent(event)) {
      return;
    }

    // Serialize the mouse event with relevant properties
    const mouseMessage = {
      type: event.type,
      x: event.clientX,
      y: event.clientY,
      button: event.button,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    };


    // Broadcast the mouse event to all crosswindow targets
    this.cw.communicationManager.sendMessage({
      targetWindowId: 'any',
      action: 'mouseEvent',
      message: mouseMessage
    });


  }

  shouldBroadcastEvent(event) {
    // Implement any logic to determine whether the event should be broadcasted
    // For example, you might want to limit mousemove events to avoid flooding
    return true; // For simplicity, broadcasting all events
  }
}
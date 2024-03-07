export default class EventReceiver {
  constructor(crosswindow) {
    this.crosswindow = crosswindow;
  }

  handleKeyboardEvent(data) {

    if (data.sourceWindowId === this.crosswindow.windowId) {
      // Don't process own inputs
      return;
    }

    // Dispatch the keyboard event locally
    const event = new KeyboardEvent(data.action, {
      code: data.message.code,
      repeat: data.message.repeat,
      shiftKey: data.message.shiftKey,
      ctrlKey: data.message.ctrlKey,
      altKey: data.message.altKey,
      metaKey: data.message.metaKey,
      bubbles: false
    });

    document.dispatchEvent(event);
  }

  handleMouseEvent(data) {
    if (data.sourceWindowId === this.crosswindow.windowId) {
      // Don't process own inputs
      return;
    }

    // Dispatch the mouse event locally
    const event = new MouseEvent(data.message.type, {
      clientX: data.message.x,
      clientY: data.message.y,
      button: data.message.button,
      ctrlKey: data.message.ctrlKey,
      shiftKey: data.message.shiftKey,
      altKey: data.message.altKey,
      metaKey: data.message.metaKey,
      bubbles: false
    });

    document.dispatchEvent(event);
  }
}
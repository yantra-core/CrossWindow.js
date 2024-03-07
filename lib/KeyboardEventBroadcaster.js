export default class KeyboardEventBroadcaster {
  constructor(crosswindow) {
    this.cw = crosswindow;
    this.initEventListeners();
  }

  initEventListeners() {
    window.document.addEventListener('keydown', this.handleKeyboardEvent.bind(this));
    window.document.addEventListener('keyup', this.handleKeyboardEvent.bind(this));
  }

  handleKeyboardEvent(event) {

    // Return early if event should not be propagated
    if (event.bubbles === false) {
      return;
    }

    // Serialize the keyboard event with relevant properties
    const keyboardMessage = {
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      repeat: event.repeat,
      type: event.type,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      bubbles: false
    };
    console.log('sending event keyevent', event.type)
    // Broadcast the keyboard event to all crosswindow targets

    this.cw.communicationManager.sendMessage({
      targetWindowId: 'any',
      action: event.type, // 'keydown' or 'keyup'
      message: keyboardMessage
    });

    /*
    this.crosswindow.postMessage({
      targetWindowId: 'any',
      action: event.type, // 'keydown' or 'keyup'
      message: keyboardMessage
    });
    */
  }
}
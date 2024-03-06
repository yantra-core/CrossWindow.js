import CrossWindow from './lib/CrossWindow.js';
function createCrossWindow (options = {}) {
  return new CrossWindow(options);
}
export {
  CrossWindow,
  createCrossWindow
};
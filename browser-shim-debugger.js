import CrossWindowDebugger from './lib/CrossWindowDebugger.js';
function createCrossWindowDebugger (options = {}) {
  return new CrossWindowDebugger(options);
}
export {
  CrossWindowDebugger,
  createCrossWindowDebugger
};
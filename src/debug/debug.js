function FwDebug(initialState, output) {
  let enabled = initialState;

  this.isEnabled = function isEnabled() {
    return enabled;
  };

  this.enable = function enable() {
    enabled = true;
  };

  this.disable = function disable() {
    enabled = false;
  };

  this.do = function debugDo(callback) {
    if (this.isEnabled()) {
      callback();
    }
  };

  this.info = function info(...args) {
    if (this.isEnabled()) {
      output.info(...args);
    }
  };

  this.warn = function warn(...args) {
    if (this.isEnabled()) {
      output.warn(...args);
    }
  };

  this.error = function error(...args) {
    if (this.isEnabled()) {
      output.error(...args);
    }
  };
}

export default new FwDebug(false, console);

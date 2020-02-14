class EventEmitter {
  constructor() {
    this._events = {};
  }

  /**
   * @param {string} event
   * @param {function} listener (callbeck)
   */
  on(event, listener) {
    (this._events[event] || (this._events[event] = [])).push(listener);
    return this;
  }

  /**
   * @param {string} event
   * @param {params} params
   */
  emit(event, params) {
    (this._events[event] || []).slice().forEach(listener => listener(params));
  }
}

export { EventEmitter };

class LocalStore {
  /**
   * @param {string} name
   * @return {arrey}
   */
  static read(name) {
    return localStorage.getItem(name) ? JSON.parse(localStorage[name]) : null;
  }

  /**
   * @param {string} name
   * @param {object} data
   */
  static update(name, data) {
    localStorage[name] = JSON.stringify(data);
  }
}

export { LocalStore };

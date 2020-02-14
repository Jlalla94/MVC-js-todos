class ListController {
  /**
   * @param {ListModel} model
   * @param {ListView} view
   */
  constructor(model, view) {
    this._model = model;
    this._view = view;

    // view liseners
    view.on("itemCreate", item => this.addItem(item));
    view.on("deleteButtonClicked", id => this.deleteItem(id));
    view.on("checkboxClicked", item => this.updateItem(item));
    view.on("toggleAllClicked", status => this.updateAllItemsStatus(status));
    view.on("deleteComplited", () => this.deleteAllComplited());
  }

  /**
   * @param {object} item
   */
  addItem(item) {
    if (item) {
      this._model.addItem(item);
    }
  }

  /**
   * @param {index} id
   */
  deleteItem(id) {
    if (id) {
      this._model.removeItem(id);
    }
  }

  /**
   * @param {object} item
   */
  updateItem(item) {
    if (item) {
      this._model.updateItem(item);
    }
  }

  /**
   * @param {string} status
   */
  updateAllItemsStatus(status) {
    this._model.updateAllItemsStatus(status);
  }

  deleteAllComplited() {
    this._model.deleteAllComplited();
  }
}

export { ListController };

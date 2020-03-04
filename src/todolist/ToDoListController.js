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
    view.on("hashChange", () => this._view.rebuildList(this._model.getItems()));

    //ModelLiseners
    model
      .on("itemAdded", listItem => {
        view.addItemToList(listItem);
        view.updateListParams(model.getItemListParams());
      })
      .on("itemRemoved", () => view.updateListParams(model.getItemListParams()))
      .on("itemUpdated", () => view.updateListParams(model.getItemListParams()))
      .on("updateAll", () => view.rebuildList(this._model.getItems()))
      .on("updateAll", () => view.updateListParams(model.getItemListParams()))
      .on("deleteAllComplited", () => view.rebuildList(this._model.getItems()))
      .on("deleteAllComplited", () =>
        view.updateListParams(model.getItemListParams(this._model.getItems()))
      );
  }

  init() {
    this._view.updateListParams(this._model.getItemListParams());
    this._view.rebuildList(this._model.getItems());
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

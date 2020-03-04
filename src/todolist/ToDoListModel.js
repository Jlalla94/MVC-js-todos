import { LocalStore } from "/src/service/LocalStore";
import { EventEmitter } from "/src/service/EventEmitter";

/**
 * Class ListModel
 */
class ListModel extends EventEmitter {
  constructor() {
    super();
    this.storeName = "toDoItems";
    this._items = LocalStore.read(this.storeName) || {};
  }

  /**
   * return {object}
   */
  getItems() {
    return Object.assign({}, this._items);
  }

  /**
   * return {object}
   */
  getItemListParams() {
    let itemListParams = {
      countActive: 0,
      countDeseble: 0
    };
    for (let item in this._items) {
      this._items[item]["status"] === ""
        ? itemListParams.countActive++
        : itemListParams.countDeseble++;
    }

    return itemListParams;
  }

  /**
   * @param {object} param0
   */
  addItem({ id: id = Date.now(), text, status: status = "" }) {
    this._items[id] = { id: id, text: text, status: status };
    LocalStore.update(this.storeName, this._items);
    this.emit("itemAdded", { id: id, text: text, status: status });
  }

  /**
   * @param {integer} id
   */
  removeItem(id) {
    delete this._items[id];
    LocalStore.update(this.storeName, this._items);
    this.emit("itemRemoved", id);
  }

  /**
   * @param {object} param0
   */
  updateItem({ id, text, status }) {
    this._items[id] = { id: id, text: text, status: status };
    LocalStore.update(this.storeName, this._items);
    this.emit("itemUpdated", { id: id, text: text, status: status });
  }

  /**
   * @param {string} status
   */
  updateAllItemsStatus(status) {
    for (let item in this._items) {
      this._items[item]["status"] = status;
    }
    LocalStore.update(this.storeName, this._items);
    this.emit("updateAll", { status });
  }

  deleteAllComplited() {
    for (let item in this._items) {
      if (this._items[item]["status"] === "completed") {
        delete this._items[item];
      }
    }
    LocalStore.update(this.storeName, this._items);
    this.emit("deleteAllComplited", {});
  }
}

export { ListModel };

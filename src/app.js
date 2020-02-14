import $ from "jquery";
import { LocalStore } from "/src/service/localStore";

class EventEmitter {
  constructor() {
    this._events = {};
  }
  on(event, listener) {
    (this._events[event] || (this._events[event] = [])).push(listener);
    return this;
  }
  emit(event, params) {
    (this._events[event] || []).slice().forEach(listener => listener(params));
  }
}

/**
 * The Model. Model stores items and notifies
 * observers about changes.
 */
class ListModel extends EventEmitter {
  constructor() {
    super();
    this.storeName = "toDoItems";
    this._items = LocalStore.read(this.storeName) || {};
  }

  getItems() {
    return Object.assign({}, this._items);
  }

  getItemListParams() {
    let itemListParams = {
      countActive: 0,
      countDeseble: 0
    };
    $.each(this._items, (index, item) =>
      item.status === ""
        ? itemListParams.countActive++
        : itemListParams.countDeseble++
    );
    return itemListParams;
  }

  addItem({ id: id = Date.now(), text: text, status: status = "" }) {
    this._items[id] = { id: id, text: text, status: status };
    LocalStore.update(this.storeName, this._items);
    this.emit("itemAdded", { id: id, text: text, status: status });
  }

  removeItem(id) {
    delete this._items[id];
    LocalStore.update(this.storeName, this._items);
    this.emit("itemRemoved", id);
  }

  updateItem({ id: id, text: text, status: status }) {
    this._items[id] = { id: id, text: text, status: status };
    LocalStore.update(this.storeName, this._items);
    this.emit("itemUpdated", { id: id, text: text, status: status });
  }

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

  // get selectedIndex() {
  //   return this._selectedIndex;
  // }

  // set selectedIndex(index) {
  //   const previousIndex = this._selectedIndex;
  //   this._selectedIndex = index;
  //   this.emit("selectedIndexChanged", previousIndex);
  // }
}

/**
 * The View. View presents the model and provides
 * the UI events. The controller is attached to these
 * events to handle the user interaction.
 */
class ListView extends EventEmitter {
  constructor(model) {
    super();
    this._model = model;
    this._elements = {
      main: $(".main"),
      toggleAll: $("#toggle-all"),
      addItem: $(".new-todo"),
      clearCompleted: $(".clear-completed"),
      toDoCount: $(".todo-count").find("strong"),
      toDoList: $(".todo-list"),
      footer: $(".footer"),
      filters: $(".filters")
    };

    //model listeners
    model
      .on("itemAdded", listItem => {
        this.addItemToList(listItem);
        this.updateListParams();
      })
      .on("itemRemoved", () => this.rebuildList())
      .on("itemRemoved", () => this.updateListParams())
      .on("itemUpdated", () => this.rebuildList())
      .on("itemUpdated", () => this.updateListParams())
      .on("updateAll", () => this.rebuildList())
      .on("updateAll", () => this.updateListParams())
      .on("deleteAllComplited", () => this.rebuildList())
      .on("deleteAllComplited", () => this.updateListParams());

    //Listeners to HTML controls
    this._elements.addItem
      .focusout(event => {
        if (
          $(event.target)
            .val()
            .replace(/\s/g, "") !== ""
        ) {
          this.emit("itemCreate", {
            text: $(event.target).val()
          });
          $(event.target).val("");
        }
      })
      .keypress(event => {
        if (
          $(event.target)
            .val()
            .replace(/\s/g, "") !== "" &&
          event.which === 13
        ) {
          this.emit("itemCreate", {
            text: $(event.target).val()
          });
          $(event.target).val("");
        }
      });

    //Only View Events
    $(window).on("hashchange", () => this.rebuildList());
  }

  show() {
    this.rebuildList();
    this.updateListParams();
  }

  addItemToList({ id: id, text: text, status: status }) {
    const hash = window.location.hash.replace("#/", "");
    const filters = this._elements.filters;
    filters.find(".selected").removeClass("selected");
    filters.find('a[href="#/' + hash + '"]').addClass("selected");
    if (hash !== "") {
      if (hash === "active") {
        if (status !== "") {
          return;
        }
      }
      if (hash === "completed") {
        if (status === "") {
          return;
        }
      }
    }
    let viewItem = $(`
    <li class="${status}">
    <div class="view">
      <input class="toggle" type="checkbox" ${status !== "" ? "checked" : ""}/>
      <label>${text}</label>
      <button class="destroy"></button>
    </div>
  </li>`);

    viewItem.find(".toggle").on("change", event => {
      let newStatus = "";
      if ($(event.target).is(":checked")) {
        viewItem.addClass("completed");
        newStatus = "completed";
      } else {
        viewItem.removeClass("completed");
        newStatus = "";
      }
      this.emit("checkboxClicked", { id: id, text: text, status: newStatus });
    });

    viewItem.find(".destroy").on("click", () => {
      this.emit("deleteButtonClicked", id);
    });

    this._elements.toDoList.append(viewItem);
  }

  rebuildList() {
    const toDoList = this._elements.toDoList;
    const items = this._model.getItems();
    toDoList.html("");
    $.each(items, (index, item) => {
      this.addItemToList(item);
    });
  }

  updateListParams() {
    const listParams = this._model.getItemListParams();
    const toDoCount = this._elements.toDoCount;

    this.checkMainView(listParams);
    this.checkToggleAll(listParams.countActive);
    this.checkClearCompleted(listParams.countDeseble);
    toDoCount.text(listParams.countActive);
  }

  checkMainView({ countActive: countActive, countDeseble: countDeseble }) {
    const main = this._elements.main;
    const footer = this._elements.footer;

    if (countActive + countDeseble === 0) {
      main.css("display", "none");
      footer.css("display", "none");
    } else if (countActive + countDeseble > 0) {
      main.css("display", "block");
      footer.css("display", "block");
    }
  }

  checkToggleAll(countActive) {
    const toggleAll = this._elements.toggleAll;

    if (countActive > 0) {
      toggleAll.prop("checked", false);
      toggleAll.on("click", () => {
        this.emit("toggleAllClicked", "completed");
      });
    } else {
      toggleAll.prop("checked", true);
      toggleAll.on("click", () => {
        this.emit("toggleAllClicked", "");
      });
    }
  }

  checkClearCompleted(countDeseble) {
    const clearCompleted = this._elements.clearCompleted;

    if (countDeseble > 0) {
      clearCompleted.css("display", "block");
      clearCompleted.on("click", () => {
        this.emit("deleteComplited", {});
      });
    } else {
      clearCompleted.css("display", "none");
    }
  }
}

/**
 * The Controller. Controller responds to user actions and
 * invokes changes on the model.
 */
class ListController {
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

  addItem(item) {
    if (item) {
      this._model.addItem(item);
    }
  }

  deleteItem(id) {
    if (id) {
      this._model.removeItem(id);
    }
  }

  updateItem(item) {
    if (item) {
      this._model.updateItem(item);
    }
  }

  updateAllItemsStatus(status) {
    this._model.updateAllItemsStatus(status);
  }

  deleteAllComplited() {
    this._model.deleteAllComplited();
  }
}

const model = new ListModel(),
  view = new ListView(model),
  controller = new ListController(model, view);

view.show();

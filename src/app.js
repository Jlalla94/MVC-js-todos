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
      footer: $(".footer")
    };

    // attach model listeners
    model
      .on("itemAdded", listItem => {
        this.addItemToList(listItem);
        this.updateListParams();
      })
      .on("itemRemoved", () => this.rebuildList())
      .on("itemUpdated", () => this.rebuildList());

    //attach listeners to HTML controls
    // elements.list.addEventListener("change", e =>
    //   this.emit("listModified", e.target.selectedIndex)
    // );
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

    // elements.delButton.addEventListener("click", () =>
    //   this.emit("delButtonClicked")
    // );
  }

  show() {
    this.rebuildList();
  }

  addItemToList({ id: id, text: text, status: status }) {
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

    $.each(items, (index, item) => this.addItemToList(item));
    this.updateListParams();
  }

  updateListParams() {
    const listParams = this._model.getItemListParams();
    const toDoCount = this._elements.toDoCount;
    const main = this._elements.main;
    const footer = this._elements.footer;
    const clearCompleted = this._elements.clearCompleted;
    const toggleAll = this._elements.toggleAll;
    console.log(123);
    if (listParams.countActive + listParams.countDeseble === 0) {
      main.css("display", "none");
      footer.css("display", "none");
    } else if (listParams.countActive + listParams.countDeseble === 1) {
      main.css("display", "block");
      footer.css("display", "block");
    }
    toDoCount.text(listParams.countActive);
    listParams.countDeseble > 0
      ? clearCompleted.css("display", "block")
      : clearCompleted.css("display", "none");
    toggleAll.attr("checked", listParams.countActive === 0);
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

    // view.on("listModified", idx => this.updateSelected(idx));
    view.on("itemCreate", item => this.addItem(item));
    view.on("deleteButtonClicked", id => this.deleteItem(id));
    view.on("checkboxClicked", item => this.updateItem(item));
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
}

const model = new ListModel(),
  view = new ListView(model),
  controller = new ListController(model, view);

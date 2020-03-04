import $ from "jquery";
import { EventEmitter } from "/src/service/EventEmitter";

class ListView extends EventEmitter {
  constructor() {
    super();
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
    this.hash = this.setHash();

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

    $(window).on("hashchange", () => {
      this.setHash();
      this.emit("hashChange");
    });
  }

  setHash() {
    this.hash = window.location.hash.replace("#/", "");
    const filters = this._elements.filters;
    filters.find(".selected").removeClass("selected");
    filters.find('a[href="#/' + this.hash + '"]').addClass("selected");
  }

  /**
   * @param {object} param0
   */
  addItemToList({ id, text, status }) {
    if (this.hash !== "") {
      if (this.hash === "active") {
        if (status !== "") {
          return;
        }
      }
      if (this.hash === "completed") {
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
      viewItem.remove();
      this.emit("deleteButtonClicked", id);
    });

    this._elements.toDoList.append(viewItem);
  }

  rebuildList(objectItems) {
    this.setHash();
    const toDoList = this._elements.toDoList;
    const items = objectItems;
    toDoList.html("");
    $.each(items, (index, item) => {
      this.addItemToList(item);
    });
  }

  updateListParams(objectParams) {
    const listParams = objectParams;
    const toDoCount = this._elements.toDoCount;

    this.checkMainView(listParams);
    this.checkToggleAll(listParams.countActive);
    this.checkClearCompleted(listParams.countDeseble);
    toDoCount.text(listParams.countActive);
  }

  /**
   * @param {object} param0
   */
  checkMainView({ countActive, countDeseble }) {
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

  /**
   * @param {integer} countActive
   */
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

  /**
   * @param {integer} countDeseble
   */
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

export { ListView };

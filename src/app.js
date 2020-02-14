import $ from "jquery";
import { LocalStore } from "/src/service/LocalStore";
import { ListModel } from "/src/todolist/ToDoListModel";
import { ListView } from "/src/todolist/ToDoListView";
import { ListController } from "/src/todolist/ToDoListController";

const model = new ListModel(),
  view = new ListView(model),
  controller = new ListController(model, view);

view.show();

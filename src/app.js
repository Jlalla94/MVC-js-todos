import { ListModel } from "/src/todolist/ToDoListModel";
import { ListView } from "/src/todolist/ToDoListView";
import { ListController } from "/src/todolist/ToDoListController";

const model = new ListModel(),
  view = new ListView(),
  controller = new ListController(model, view);

controller.init();

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.static("public"));

const todosFile = path.join(__dirname, "todos.json");

// 讀取 todos
function readTodos() {
  try {
    const data = fs.readFileSync(todosFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 儲存 todos
function saveTodos(todos) {
  fs.writeFileSync(todosFile, JSON.stringify(todos, null, 2));
}

// GET - 取得所有 todos
app.get("/todos", (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

// POST - 新增 todo
app.post("/todos", (req, res) => {
  const todos = readTodos();
  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
    title: req.body.title,
    completed: req.body.completed || false,
  };
  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

// GET - 取得單一 todo
app.get("/todos/:id", (req, res) => {
  const todos = readTodos();
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }
  res.json(todo);
});

// PUT - 更新 todo
app.put("/todos/:id", (req, res) => {
  const todos = readTodos();
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todo.title = req.body.title || todo.title;
  todo.completed =
    req.body.completed !== undefined ? req.body.completed : todo.completed;

  saveTodos(todos);
  res.json(todo);
});

// DELETE - 刪除 todo
app.delete("/todos/:id", (req, res) => {
  let todos = readTodos();
  const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todos.splice(index, 1);
  saveTodos(todos);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

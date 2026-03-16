require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- 路由定義區 ---
app.get("/", (req, res) => {
  res.json({ message: "伺服器運作中！" });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", serverTime: result.rows[0].now });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Database connection failed", message: err.message });
  }
});

app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 新增待辦事項 (Create)
app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;

    const queryText = "INSERT INTO todos (title) VALUES ($1) RETURNING *";
    const result = await pool.query(queryText, [title]);

    console.log("成功新增一筆資料：", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("新增失敗：", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 修改待辦事項 (Update)
app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const queryText =
      "UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *";
    const result = await pool.query(queryText, [title, completed, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "找不到該筆資料" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 刪除待辦事項 (Delete)
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "找不到該筆資料" });
    }
    res.json({ message: "刪除成功", deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- 啟動伺服器 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

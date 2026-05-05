import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { todos, todosCategories, categories } from "../db/schema.js";

export const todoRouter = Router();

// GET /api/todos — list all todos (with categories)
todoRouter.get("/", async (_req, res) => {
  try {
    const result = await db.query.todos.findMany({
      with: {
        todosCategories: {
          with: { category: true },
        },
      },
      orderBy: (todos, { desc }) => [desc(todos.createdAt)],
    });

    const formatted = result.map(({ todosCategories, ...todo }) => ({
      ...todo,
      categories: todosCategories.map((tc) => tc.category),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/todos/:id
todoRouter.get("/:id", async (req, res) => {
  try {
    const result = await db.query.todos.findFirst({
      where: eq(todos.id, Number(req.params.id)),
      with: {
        todosCategories: {
          with: { category: true },
        },
      },
    });

    if (!result) return res.status(404).json({ error: "Todo not found" });

    const { todosCategories: tc, ...todo } = result;
    res.json({ ...todo, categories: tc.map((t) => t.category) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos — create todo
// body: { title, description?, priority?, dueDate?, categoryIds?: number[] }
todoRouter.post("/", async (req, res) => {
  try {
    const { title, description, priority, dueDate, categoryIds } = req.body;

    if (!title) return res.status(400).json({ error: "title is required" });

    const [newTodo] = await db
      .insert(todos)
      .values({ title, description, priority, dueDate })
      .returning();

    if (categoryIds?.length) {
      await db.insert(todosCategories).values(
        categoryIds.map((categoryId) => ({
          todoId: newTodo.id,
          categoryId,
        }))
      );
    }

    // re-fetch with categories
    const full = await db.query.todos.findFirst({
      where: eq(todos.id, newTodo.id),
      with: { todosCategories: { with: { category: true } } },
    });

    const { todosCategories: tc, ...todo } = full;
    res.status(201).json({ ...todo, categories: tc.map((t) => t.category) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/todos/:id — update todo
todoRouter.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, completed, priority, dueDate, categoryIds } =
      req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (completed !== undefined) updates.completed = completed;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    updates.updatedAt = new Date().toISOString();

    const [updated] = await db
      .update(todos)
      .set(updates)
      .where(eq(todos.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Todo not found" });

    // sync categories if provided
    if (categoryIds !== undefined) {
      await db.delete(todosCategories).where(eq(todosCategories.todoId, id));
      if (categoryIds.length) {
        await db
          .insert(todosCategories)
          .values(
            categoryIds.map((categoryId) => ({ todoId: id, categoryId }))
          );
      }
    }

    const full = await db.query.todos.findFirst({
      where: eq(todos.id, id),
      with: { todosCategories: { with: { category: true } } },
    });

    const { todosCategories: tc, ...todo } = full;
    res.json({ ...todo, categories: tc.map((t) => t.category) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/todos/:id
todoRouter.delete("/:id", async (req, res) => {
  try {
    const [deleted] = await db
      .delete(todos)
      .where(eq(todos.id, Number(req.params.id)))
      .returning();

    if (!deleted) return res.status(404).json({ error: "Todo not found" });

    res.json({ message: "Deleted", id: deleted.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos/:id/categories — attach categories
// body: { categoryIds: number[] }
todoRouter.post("/:id/categories", async (req, res) => {
  try {
    const todoId = Number(req.params.id);
    const { categoryIds } = req.body;

    if (!categoryIds?.length)
      return res.status(400).json({ error: "categoryIds is required" });

    await db
      .insert(todosCategories)
      .values(categoryIds.map((categoryId) => ({ todoId, categoryId })))
      .onConflictDoNothing();

    const full = await db.query.todos.findFirst({
      where: eq(todos.id, todoId),
      with: { todosCategories: { with: { category: true } } },
    });

    const { todosCategories: tc, ...todo } = full;
    res.json({ ...todo, categories: tc.map((t) => t.category) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/todos/:id/categories/:categoryId — detach a category
todoRouter.delete("/:id/categories/:categoryId", async (req, res) => {
  try {
    const todoId = Number(req.params.id);
    const categoryId = Number(req.params.categoryId);

    await db
      .delete(todosCategories)
      .where(
        and(
          eq(todosCategories.todoId, todoId),
          eq(todosCategories.categoryId, categoryId)
        )
      );

    res.json({ message: "Category detached" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

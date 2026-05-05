import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { categories, todosCategories } from "../db/schema.js";

export const categoryRouter = Router();

// GET /api/categories
categoryRouter.get("/", async (_req, res) => {
  try {
    const result = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:id — with its todos
categoryRouter.get("/:id", async (req, res) => {
  try {
    const result = await db.query.categories.findFirst({
      where: eq(categories.id, Number(req.params.id)),
      with: {
        todosCategories: {
          with: { todo: true },
        },
      },
    });

    if (!result) return res.status(404).json({ error: "Category not found" });

    const { todosCategories: tc, ...category } = result;
    res.json({ ...category, todos: tc.map((t) => t.todo) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
categoryRouter.post("/", async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) return res.status(400).json({ error: "name is required" });

    const [created] = await db
      .insert(categories)
      .values({ name, color })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    if (err.message?.includes("unique"))
      return res.status(409).json({ error: "Category name already exists" });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/categories/:id
categoryRouter.patch("/:id", async (req, res) => {
  try {
    const { name, color } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    updates.updatedAt = new Date().toISOString();

    const [updated] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, Number(req.params.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Category not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
categoryRouter.delete("/:id", async (req, res) => {
  try {
    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, Number(req.params.id)))
      .returning();

    if (!deleted) return res.status(404).json({ error: "Category not found" });

    res.json({ message: "Deleted", id: deleted.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

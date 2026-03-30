import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── todos ───
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  priority: integer("priority").default(0).notNull(), // 0=low, 1=medium, 2=high
  dueDate: timestamp("due_date", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// ─── categories ───
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#3b82f6"), // hex color
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// ─── many-to-many junction table ───
export const todosCategories = pgTable(
  "todos_categories",
  {
    todoId: integer("todo_id")
      .notNull()
      .references(() => todos.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.todoId, t.categoryId] })]
);

// ─── relations ───
export const todosRelations = relations(todos, ({ many }) => ({
  todosCategories: many(todosCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  todosCategories: many(todosCategories),
}));

export const todosCategoriesRelations = relations(
  todosCategories,
  ({ one }) => ({
    todo: one(todos, {
      fields: [todosCategories.todoId],
      references: [todos.id],
    }),
    category: one(categories, {
      fields: [todosCategories.categoryId],
      references: [categories.id],
    }),
  })
);

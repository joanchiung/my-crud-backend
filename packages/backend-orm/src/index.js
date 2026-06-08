import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "yaml";
import { todoRouter } from "./routes/todos.js";
import { categoryRouter } from "./routes/categories.js";

const swaggerDoc = yaml.parse(
  fs.readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8")
);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use("/api/todos", todoRouter);
app.use("/api/categories", categoryRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});

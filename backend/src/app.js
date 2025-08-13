import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import { router as tasksRouter } from "./tasks.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// API routes
app.use("/api/tasks", tasksRouter);

// Swagger docs (serves src/openapi.json)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, { swaggerUrl: "/openapi.json" })
);
app.get("/openapi.json", (req, res) => {
  res.sendFile(path.join(__dirname, "openapi.json"));
});

// 404 + error handlers
app.use((req, res) => {
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "Route not found" } });
});
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 400;
  res.status(status).json({
    error: {
      code: err.code || "BAD_REQUEST",
      message: err.message || "Request failed",
    },
  });
});

export default app;

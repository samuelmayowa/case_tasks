// backend/src/server.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Swagger / "activeapi" wiring ----
const specPath = path.join(__dirname, "activeapi.json");
let swaggerDoc = {};
try {
  swaggerDoc = JSON.parse(readFileSync(specPath, "utf8"));
} catch (e) {
  console.error("[swagger] Failed to load", specPath, e.message);
}

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.get("/activeapi.json", (_req, res) => res.json(swaggerDoc));

app.get("/openapi.json", (_req, res) => res.redirect(301, "/activeapi.json"));

// ---- DB + Server boot ----
const port = process.env.PORT || 4000;
const publicUrl = process.env.PUBLIC_URL || `http://localhost:${port}`;
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/tasksdb";

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Backend API ready: ${publicUrl} (docs: ${publicUrl}/docs)`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });

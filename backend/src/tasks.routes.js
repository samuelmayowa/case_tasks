import { Router } from "express";
import { z as Zod } from "zod";
import { Task } from "./task.model.js";
import mongoose from "mongoose";

export const router = Router();

/** Schema: payload for creating a task */
const TaskCreateSchema = Zod.object({
  title: Zod.string().min(1),
  description: Zod.string().optional(),
  status: Zod.enum(["todo", "in_progress", "done"]).default("todo"),
  dueDate: Zod.preprocess(
    (value) =>
      typeof value === "string" || value instanceof Date
        ? new Date(value)
        : value,
    Zod.date()
  ),
});

/** Schema: payload for updating only the status */
const TaskStatusUpdateSchema = Zod.object({
  status: Zod.enum(["todo", "in_progress", "done"]),
});

router.post("/", async (req, res, next) => {
  try {
    const payload = TaskCreateSchema.parse(req.body);
    const task = await Task.create(payload);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ error: { code: "TASK_NOT_FOUND", message: "Task not found" } });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = TaskStatusUpdateSchema.parse(req.body);
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!task) {
      return res
        .status(404)
        .json({ error: { code: "TASK_NOT_FOUND", message: "Task not found" } });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json({ error: { code: "TASK_NOT_FOUND", message: "Task not found" } });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

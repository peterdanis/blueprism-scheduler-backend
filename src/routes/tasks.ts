import {
  addTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from "../controllers/task";
import { create, del, getMany, update } from "./shared";
import { Router } from "express";

const router = Router();

// Get all tasks
router.get("/", getMany(getTasks));

// Create new task and return it
router.post("/", create(addTask, "Task"));

// Update task
router.patch("/:taskId", update("taskId", getTask, updateTask, "Task"));

// Delete specific task
router.delete("/:taskId", del("taskId", deleteTask));

export default router;

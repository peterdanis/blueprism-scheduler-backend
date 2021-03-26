import { addTask, getTasks } from "../controllers/task";
import { create, getMany } from "./shared";
import { Router } from "express";

const router = Router();

// Get all tasks
router.get("/", getMany(getTasks));

// Create new task and return it
router.post("/", create(addTask, "Task"));

export default router;

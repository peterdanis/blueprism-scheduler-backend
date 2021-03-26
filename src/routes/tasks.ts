import { addTask, getTask, getTasks } from "../controllers/task";
import CustomError from "../utils/customError";
import { Router } from "express";
import Task from "../entities/Task";
import toInteger from "../utils/toInteger";

const router = Router();

// Get all tasks
router.get("/", async (req, res, next) => {
  try {
    const tasks = await getTasks();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create new task and return it
router.post("/", async (req, res, next) => {
  try {
    const task = await addTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    const msg: string = error.message;
    if (/NULL/.test(msg)) {
      next(
        new CustomError(
          "Task can not be created, a required parameter is missing",
          422,
        ),
      );
      return;
    }
    next(error);
  }
});

// Get specific task
router.get("/:taskId", async (req, res, next) => {
  try {
    const { runtimeResourceId: taskId } = req.params;
    let task: Task | undefined;
    if (taskId) {
      const parsedTaskId = toInteger(taskId);
      if (parsedTaskId) {
        task = await getTask(parsedTaskId);
      }
    }
    if (!task) {
      throw new CustomError("Task not found", 404);
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

export default router;

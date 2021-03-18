import { clearScheduleCache } from "./schedule";
import Task from "../entities/Task";

let tasksCache: Task[] | undefined;

const clearCache = (): void => {
  tasksCache = undefined;
  clearScheduleCache();
};

export const getTasks = async (): Promise<Task[]> => {
  if (!tasksCache) {
    tasksCache = await Task.find();
  }
  return tasksCache;
};

export const getTask = async (
  nameOrId: string | number,
): Promise<Task | undefined> => {
  const tasks = await getTasks();
  const [task] = tasks.filter((_task) => {
    if (typeof nameOrId === "string") {
      return _task.name === nameOrId;
    }
    return _task.id === nameOrId;
  });
  return task;
};

export const updateTask = async (task: Task): Promise<Task> => {
  await task.save();
  clearCache();
  return task;
};

export const addTask = async (taskLikeObject: Partial<Task>): Promise<Task> => {
  const task = Task.create(taskLikeObject);
  await task.save();
  clearCache();
  return task;
};

export const deleteTask = async (task: Task): Promise<Task> => {
  clearCache();
  return task.remove();
};

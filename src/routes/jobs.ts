import { addJob, getJobs } from "../controllers/job";
import CustomError from "../utils/customError";
import { getMany } from "./shared";
import { getSchedule } from "../controllers/schedule";
import Job from "../entities/Job";
import { Router } from "express";
import toNumber from "../utils/toInteger";
import User from "../entities/User";

const router = Router();

// Get all jobs
router.get("/", getMany(getJobs as () => Promise<Job[]>, undefined));

// Add new job to queue
router.post("/", async (req, res, next) => {
  try {
    const { scheduleId, scheduleName } = req.body;
    if (typeof scheduleId !== "string" && typeof scheduleName !== "string") {
      throw new CustomError(
        "Job can not be started, scheduleId nor scheduleName parameter is defined",
        422,
      );
    }
    const parsedScheduleId = toNumber(scheduleId);
    const schedule = await getSchedule(
      (parsedScheduleId || scheduleName) as number | string,
    );
    if (!schedule) {
      throw new CustomError(
        `Job can not be started, schedule with ${scheduleId ? "id" : "name"} ${
          scheduleId || scheduleName
        } was not found`,
        422,
      );
    }
    let user: Partial<User> = { id: 0, name: "unknown" };
    if (req.user) {
      user = req.user;
    }
    const job = await addJob(schedule, `userId:${user.id}, name:${user.name}`);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

export default router;

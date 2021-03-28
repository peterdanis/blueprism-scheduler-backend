import { addJob, getJobs, stopJob } from "../controllers/job";
import CustomError from "../utils/customError";
import { getMany } from "./shared";
import { getSchedule } from "../controllers/schedule";
import Job from "../entities/Job";
import { Router } from "express";
import toInteger from "../utils/toInteger";
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
    const parsedScheduleId = toInteger(scheduleId);
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

// Cancel queued job
router.delete("/:jobId", async (req, res, next) => {
  try {
    let user: Partial<User> = { id: 0, name: "unknown" };
    const { hardStop } = req.body;
    const { jobId } = req.params;
    if (req.user) {
      user = req.user;
    }
    const parsedId = toInteger(jobId);
    if (parsedId) {
      await stopJob(parsedId, user, hardStop);
      res.status(200).json({});
    } else {
      throw new CustomError("$Job not found", 404);
    }
  } catch (error) {
    next(error);
  }
});

export default router;

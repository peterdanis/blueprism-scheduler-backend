import { addJob } from "../controllers/job";
import CustomError from "../utils/customError";
import { getSchedule } from "../controllers/schedule";
import { Router } from "express";
import toNumber from "../utils/toInteger";

const router = Router();

// Get all jobs
router.get("/", async (req, res, next) => {
  try {
    //
  } catch (error) {
    next(error);
  }
});

// Add new job to queue
router.post("/", async (req, res, next) => {
  try {
    const { scheduleId, scheduleName } = req.params;
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
    // TODO: Add user id
    const job = await addJob(schedule, "req.user?.id");
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

// Get specific job
router.get("/:jobId", async (req, res, next) => {
  try {
    //
  } catch (error) {
    next(error);
  }
});

export default router;

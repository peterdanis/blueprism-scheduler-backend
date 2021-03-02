import { addJob } from "../controllers/job";
import CustomError from "../utils/customError";
import { getSchedule } from "../controllers/schedule";
import { Router } from "express";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    //
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    // let schedule: Schedule | undefined;
    const { scheduleId, scheduleName } = req.params;
    if (!scheduleId && !scheduleName) {
      throw new CustomError(
        "Job can not be started, scheduleId nor scheduleName parameter is defined",
        422,
      );
    }
    const schedule = await getSchedule(
      // TODO: check whether scheduleId is number and convert it
      (scheduleId || scheduleName) as string | number,
    );
    if (!schedule) {
      throw new CustomError(
        `Job can not be started, schedule with ${scheduleId ? "id" : "name"} ${
          scheduleId || scheduleName
        } was not found`,
        422,
      );
    }
    const job = await addJob(schedule, req.user.id);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

router.get("/:jobId", async (req, res, next) => {
  try {
    //
  } catch (error) {
    next(error);
  }
});

export default router;

import {
  getSchedule,
  getSchedules,
  updateSchedule,
} from "../controllers/schedule";
import CustomError from "../utils/customError";
import { Router } from "express";
import Schedule from "../entities/Schedule";
import toInteger from "../utils/toInteger";

const router = Router();

// Get all schedules
router.get("/", async (req, res, next) => {
  try {
    const schedules = await getSchedules();
    res.status(200).json(schedules);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    //
  } catch (error) {
    next(error);
  }
});

// Get specific schedule
router.get("/:scheduleId", async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    let schedule: Schedule | undefined;
    if (scheduleId) {
      const parsedScheduleId = toInteger(scheduleId);
      if (parsedScheduleId) {
        schedule = await getSchedule(parsedScheduleId);
      }
    }
    if (!schedule) {
      throw new CustomError("Schedule not found", 404);
    }
    res.status(200).json(schedule);
  } catch (error) {
    next(error);
  }
});

// Update schedule
router.patch("/:scheduleId", async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    let schedule: Schedule | undefined;
    if (scheduleId) {
      const parsedScheduleId = toInteger(scheduleId);
      if (parsedScheduleId) {
        schedule = await getSchedule(parsedScheduleId);
      }
    }
    if (!schedule) {
      throw new CustomError("Schedule not found", 404);
    }
    const updatedSchedule = await updateSchedule(
      Object.assign(schedule, req.body),
    );
    res.status(200).json(updatedSchedule);
  } catch (error) {
    next(error);
  }
});

export default router;

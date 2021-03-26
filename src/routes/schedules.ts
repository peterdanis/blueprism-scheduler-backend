import {
  addSchedule,
  getSchedule,
  getSchedules,
  updateSchedule,
} from "../controllers/schedule";
import { create, getMany, getOne } from "./shared";
import CustomError from "../utils/customError";
import { Router } from "express";
import Schedule from "../entities/Schedule";
import toInteger from "../utils/toInteger";

const router = Router();

// Get all schedules
router.get("/", getMany(getSchedules));

// Create new schedule
router.post("/", create(addSchedule, "Schedule"));

// Get specific schedule
router.get("/:scheduleId", getOne("scheduleId", getSchedule, "Schedule"));

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

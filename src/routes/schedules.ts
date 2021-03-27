import {
  addSchedule,
  getSchedule,
  getSchedules,
  updateSchedule,
} from "../controllers/schedule";
import { create, getMany, getOne, update } from "./shared";
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
router.patch(
  "/:scheduleId",
  update("scheduleId", getSchedule, updateSchedule, "Schedule"),
);

export default router;

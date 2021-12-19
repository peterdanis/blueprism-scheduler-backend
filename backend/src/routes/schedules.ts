import {
  addSchedule,
  deleteSchedule,
  getSchedule,
  getSchedules,
  updateSchedule,
} from "../controllers/schedule";
import { create, del, getMany, getOne, update } from "./shared";
import { Router } from "express";

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

router.delete("/:scheduleId", del("scheduleId", deleteSchedule));

export default router;

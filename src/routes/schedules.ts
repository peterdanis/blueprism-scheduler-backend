import { getSchedules } from "../controllers/schedule";
import { Router } from "express";

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

router.get("/:scheduleId", async (req, res, next) => {
  try {
    //
  } catch (error) {
    next(error);
  }
});

export default router;

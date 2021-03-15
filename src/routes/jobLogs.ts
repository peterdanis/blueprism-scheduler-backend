import { getJobLogs } from "../controllers/jobLog";
import { Router } from "express";

const router = Router();

// Get all jobLogs
router.get("/", async (req, res, next) => {
  try {
    const jobs = await getJobLogs();
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
});

export default router;

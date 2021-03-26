import { getJobLogs } from "../controllers/jobLog";
import { getMany } from "./shared";
import { Router } from "express";

const router = Router();

// Get all jobLogs
router.get("/", getMany(getJobLogs));

export default router;

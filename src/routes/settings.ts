import { getMany } from "./shared";
import { getSettings } from "../controllers/setting";
import { Router } from "express";

const router = Router();

// Get all settings
router.get("/", getMany(getSettings));

export default router;

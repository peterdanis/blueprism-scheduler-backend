import {
  addRuntimeResource,
  getRuntimeResources,
} from "../controllers/runtimeResource";
import CustomError from "../utils/customError";
import { Router } from "express";

const router = Router();

// Get all schedules
router.get("/", async (req, res, next) => {
  try {
    const schedules = await getRuntimeResources();
    res.status(200).json(schedules);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { hostname, port, username, password } = req.body;
    if (!hostname || !port || !username || !password) {
      throw new CustomError(
        "Runtime resource can not be created, a required parameter is missing",
        422,
      );
    }
    const runtimeResource = await addRuntimeResource(
      hostname,
      port,
      username,
      password,
    );
    res.status(201).json(runtimeResource);
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

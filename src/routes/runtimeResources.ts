import {
  addRuntimeResource,
  getRuntimeResource,
  getRuntimeResources,
} from "../controllers/runtimeResource";
import CustomError from "../utils/customError";
import { Router } from "express";
import RuntimeResource from "../entities/RuntimeResource";
import toInteger from "../utils/toInteger";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const runtimeResources = await getRuntimeResources();
    res.status(200).json(runtimeResources);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const runtimeResource = await addRuntimeResource(req.body);
    res.status(201).json(runtimeResource);
  } catch (error) {
    const msg: string = error.message;
    if (/NULL/.test(msg)) {
      next(
        new CustomError(
          "Runtime resource can not be created, a required parameter is missing",
          422,
        ),
      );
      return;
    }
    next(error);
  }
});

router.get("/:runtimeResourceId", async (req, res, next) => {
  try {
    const { runtimeResourceId } = req.params;
    let runtimeResource: RuntimeResource | undefined;
    if (runtimeResourceId) {
      const parsedRuntimeResourceId = toInteger(runtimeResourceId);
      if (parsedRuntimeResourceId) {
        runtimeResource = await getRuntimeResource(parsedRuntimeResourceId);
      }
    }
    if (!runtimeResource) {
      throw new CustomError("Runtime resource not found", 404);
    }
    res.status(200).json(runtimeResource);
  } catch (error) {
    next(error);
  }
});

export default router;

import {
  addRuntimeResource,
  getRuntimeResource,
  getRuntimeResources,
  updateRuntimeResource,
} from "../controllers/runtimeResource";
import { create, getMany, getOne, update } from "./shared";
import { Router } from "express";

const router = Router();

// Get all runtime resources
router.get("/", getMany(getRuntimeResources));

// Create runtime resource
router.post("/", create(addRuntimeResource, "Runtime resource"));

// Get specific runtime resource
router.get(
  "/:runtimeResourceId",
  getOne("runtimeResourceId", getRuntimeResource, "Runtime resource"),
);

// Update runtime resource
router.patch(
  "/:runtimeResourceId",
  update(
    "runtimeResourceId",
    getRuntimeResource,
    updateRuntimeResource,
    "Runtime resource",
  ),
);

export default router;

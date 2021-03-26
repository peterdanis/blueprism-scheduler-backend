import {
  addRuntimeResource,
  getRuntimeResource,
  getRuntimeResources,
} from "../controllers/runtimeResource";
import { create, getMany, getOne } from "./shared";
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

export default router;

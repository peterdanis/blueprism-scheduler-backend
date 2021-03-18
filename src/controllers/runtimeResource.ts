import { clearScheduleCache } from "./schedule";
import RuntimeResource from "../entities/RuntimeResource";

export const getRuntimeResources = async (): Promise<RuntimeResource[]> =>
  RuntimeResource.find();

export const addRuntimeResource = (
  runtimeResourceLikeObject: Partial<RuntimeResource>,
): Promise<RuntimeResource> => {
  clearScheduleCache();
  const runtimeResource = RuntimeResource.create(runtimeResourceLikeObject);
  return runtimeResource.save();
};

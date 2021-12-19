import { clearScheduleCache } from "./schedule";
import RuntimeResource from "../entities/RuntimeResource";

let runtimeResourcesCache: RuntimeResource[] | undefined;

const clearCache = (): void => {
  runtimeResourcesCache = undefined;
  clearScheduleCache();
};

export const getRuntimeResources = async (): Promise<RuntimeResource[]> => {
  if (!runtimeResourcesCache) {
    runtimeResourcesCache = await RuntimeResource.find();
  }
  return runtimeResourcesCache;
};

export const addRuntimeResource = (
  runtimeResourceLikeObject: Partial<RuntimeResource>,
): Promise<RuntimeResource> => {
  clearCache();
  const runtimeResource = RuntimeResource.create(runtimeResourceLikeObject);
  return runtimeResource.save();
};

export const getRuntimeResource = async (
  nameOrId: string | number,
): Promise<RuntimeResource | undefined> => {
  const runtimeResources = await getRuntimeResources();
  const [runtimeResource] = runtimeResources.filter((_runtimeResource) => {
    if (typeof nameOrId === "string") {
      return _runtimeResource.friendlyName === nameOrId;
    }
    return _runtimeResource.id === nameOrId;
  });
  return runtimeResource;
};

export const updateRuntimeResource = async (
  runtimeResource: RuntimeResource,
): Promise<RuntimeResource> => {
  await runtimeResource.save();
  clearCache();
  return runtimeResource;
};

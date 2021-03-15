import RuntimeResource from "../entities/RuntimeResource";

export const getRuntimeResources = async (): Promise<RuntimeResource[]> =>
  RuntimeResource.find();

export const addRuntimeResource = (
  hostname: string,
  port: number,
  username: string,
  password: string,
): Promise<RuntimeResource> => {
  const runtimeResource = RuntimeResource.create();
  runtimeResource.auth = "basic";
  runtimeResource.https = true;
  runtimeResource.hostname = hostname;
  runtimeResource.port = port;
  runtimeResource.username = username;
  runtimeResource.password = password;
  return runtimeResource.save();
};

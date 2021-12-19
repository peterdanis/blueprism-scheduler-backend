import RuntimeResource from "../../src/entities/RuntimeResource";

export const dummyMachine: Partial<RuntimeResource> = {
  hostname: "testHostname",
  password: "testPassword",
  port: 3000,
  username: "testUsername",
};

// @ts-ignore
RuntimeResource.find.mockImplementation(
  async (): Promise<RuntimeResource[]> => {
    return [dummyMachine as RuntimeResource];
  },
);

export default RuntimeResource;

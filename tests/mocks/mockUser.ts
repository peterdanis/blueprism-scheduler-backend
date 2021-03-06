import User from "../../src/entities/User";

export const dummyUser: Partial<User> = {
  id: 1,
  name: "TestUser",
  password: "$2a$10$MssG26jzGpdgzjyAERlQT.wXdM87duv7OMguJ0GAVbuSNIxXFooFW", // Bcrypted "password"
};

// @ts-ignore
User.find.mockImplementation(
  async (): Promise<User[]> => {
    return [dummyUser as User];
  },
);

// @ts-ignore
User.create.mockImplementation(
  (): User => {
    return {
      ...dummyUser,
      save: async () => {
        return dummyUser as User;
      },
    } as User;
  },
);

export default User;

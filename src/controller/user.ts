import User from "../entity/User";

export const addUser = async (name: string): Promise<User> => {
  const user = User.create({ name });
  return user.save();
};

export const updateUser = async (): Promise<void> => {
  //
};

import { compare, hash } from "bcrypt";
import User from "../entity/User";

const saltRounds = 10;

export const addUser = async (
  name: string,
  password: string,
): Promise<User> => {
  const user = User.create({ name });
  user.password = await hash(password, saltRounds);
  return user.save();
};

export const updateUser = async (): Promise<void> => {
  //
};

export const verifyPassword = async (password: string): Promise<void> => {
  //
};

import { compare, hash } from "bcrypt";
import { createHash } from "crypto";
import User from "../entity/User";
import { v4 as uuid } from "uuid";

const saltRounds = 10;

let userCache: User[] | undefined;

export const addUser = async (
  name: string,
  password: string,
): Promise<User> => {
  userCache = undefined;
  const user = User.create({ name });
  user.password = await hash(password, saltRounds);
  await user.save();
  return user;
};

export const getUsers = async (): Promise<User[]> => {
  if (!userCache) {
    userCache = await User.find();
  }
  return userCache;
};

export const getUser = async (name: string): Promise<User | undefined> => {
  const users = await getUsers();
  const [user] = users.filter((_user) => _user.name === name);
  return user;
};

export const updateUser = async (user: User): Promise<User> => {
  userCache = undefined;
  return user.save();
};

export const generateApiKey = async (name: string): Promise<string> => {
  const user = await getUser(name);
  if (!user) {
    throw new Error("No user found");
  }
  const apiKey = createHash("sha256").update(uuid()).digest("base64");
  user.apiKey = await hash(apiKey, saltRounds);
  await updateUser(user);
  return apiKey;
};

export const deleteUser = async (id: number): Promise<User | undefined> => {
  userCache = undefined;
  const user = await User.findOne(id);
  return user?.remove();
};

export const verify = async (
  secret: string,
  name: string,
  type: "password" | "apiKey",
): Promise<boolean> => {
  const user = await getUser(name);
  if (user) {
    const storedSecret = type === "password" ? user.password : user.apiKey;
    return compare(secret, storedSecret);
  }
  return false;
};

import { compare, hash } from "bcrypt";
import { createHash } from "crypto";
import User from "../entities/User";
import { v4 as uuid } from "uuid";

const saltRounds = 10;

let userCache: User[] | undefined;

const generateHash = (string: string): string =>
  createHash("sha256").update(string).digest("base64");

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

export const getUser = async (
  nameOrId: string | number,
): Promise<User | undefined> => {
  const users = await getUsers();
  const [user] = users.filter((_user) => {
    if (typeof nameOrId === "string") {
      return _user.name === nameOrId;
    }
    return _user.id === nameOrId;
  });
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

  const apiKey = (generateHash(uuid()) + generateHash(uuid())).slice(
    0,
    20 + Math.random() * 100,
  );
  user.apiKey = await hash(apiKey, saltRounds);
  user.apiKeyHash = generateHash(apiKey);
  await updateUser(user);
  return apiKey;
};

export const deleteUser = async (id: number): Promise<User | undefined> => {
  userCache = undefined;
  const user = await User.findOne(id);
  return user?.remove();
};

export const verifyPassword = async (
  name: string,
  secret: string,
): Promise<User | undefined> => {
  const user = await getUser(name);
  if (user) {
    const match = await compare(secret, user.password);
    return match ? user : undefined;
  }
  return undefined;
};

export const verifyApiKey = async (
  secret: string,
): Promise<User | undefined> => {
  const users = await getUsers();
  const [user] = users.filter(({ apiKey, apiKeyHash }) => {
    if (apiKeyHash === generateHash(secret)) {
      return compare(secret, apiKey);
    }
    return false;
  });
  if (user) {
    return user;
  }
  return undefined;
};

export const changePassword = async (
  nameOrId: string | number,
  password: string,
): Promise<void> => {
  const user = await getUser(nameOrId);
  if (!user) {
    throw new Error("No user found");
  }
  user.password = await hash(password, saltRounds);
  await updateUser(user);
};

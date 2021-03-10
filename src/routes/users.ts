import { addUser, getUser, getUsers } from "../controllers/user";
import CustomError from "../utils/customError";
import { Router } from "express";
import toNumber from "../utils/toInteger";
import User from "../entities/User";

const router = Router();

// Get all users
router.get("/", async (req, res, next) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// Create new user and return it
router.post("/", async (req, res, next) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      throw new CustomError(
        `User can not be created, ${
          name ? "password" : "name"
        } parameter is missing`,
        422,
      );
    }
    const user = await addUser(name, password);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Get specific user
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    let user: User | undefined;
    if (userId) {
      const parsedUserId = toNumber(userId);
      if (parsedUserId) {
        user = await getUser(parsedUserId);
      }
    }
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;

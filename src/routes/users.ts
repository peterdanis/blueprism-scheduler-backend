import { addUser, getUser, getUsers } from "../controllers/user";
import CustomError from "../utils/customError";
import { Router } from "express";
import User from "../entities/User";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, password } = req.params;
    if (!name || !password) {
      throw new CustomError(
        `User can not be created, ${
          name ? "password" : "name"
        } paremeter is missing`,
        422,
      );
    }
    const user = await addUser(name, password);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    let user: User | undefined;
    if (userId) {
      const parsedId = parseInt(userId, 10);
      if (Number.isInteger(parsedId)) {
        user = await getUser(parsedId);
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

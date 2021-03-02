import { addUser, getUser, getUsers } from "../controllers/user";
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
      res.status(422).json({
        error: `User can not be created, ${
          name ? "password" : "name"
        } paremeter is missing`,
      });
      return;
    }
    const user = await addUser(name, password);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    let user: User | undefined;
    if (userId && !Number.isNaN(userId)) {
      user = await getUser(parseInt(userId, 10));
    }
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;

import {
  addUser,
  deleteUser,
  generateApiKey,
  getUser,
  getUsers,
} from "../controllers/user";
import { create, del, getMany, getOne } from "./shared";
import { Router } from "express";
import toInteger from "../utils/toInteger";

const router = Router();

// Get all users
router.get("/", getMany(getUsers));

// Create new user and return it
router.post("/", create(addUser, "User"));

// Get specific user
router.get("/:userId", getOne("userId", getUser, "User"));

// Delete specific user
router.delete("/:userId", del("userId", deleteUser));

// Create new API key and return it
router.post("/:userId/apikey", async (req, res, next) => {
  let key: string | undefined;
  try {
    const { userId } = req.params;
    if (userId) {
      const parsedUserId = toInteger(userId);
      if (parsedUserId) {
        key = await generateApiKey(parsedUserId);
      }
    }
    res.status(200).json({ apiKey: key });
  } catch (error) {
    next(error);
  }
});

export default router;

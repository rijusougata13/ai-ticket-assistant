import express from "express";

import { getUsers, login, logout, singUp, updateUser } from "../controller/user.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router();

router.post("/login", login);
router.post("/signup", singUp);
router.get("/logout", authenticate, logout);
router.get("/users", authenticate, getUsers);
router.post("/update", authenticate, updateUser);

export default router;
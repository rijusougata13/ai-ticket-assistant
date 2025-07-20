import express from "express";

import { getUser, login, logout, singUp } from "../controller/user.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router();

router.post("/login", login);
router.post("/signup", singUp);
router.get("/logout", authenticate, logout);
router.get("/users", authenticate, getUser);

export default router;
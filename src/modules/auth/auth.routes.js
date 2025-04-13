import express from "express";
import { registerValidation, loginValidation } from "./auth.validator.js";
import { registerUser, loginUser } from "./auth.controller.js";

const router = express.Router();

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);

export default router;

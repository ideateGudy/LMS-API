import express from "express";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
} from "./auth.validator.js";
import { registerUser, loginUser, forgotPassword } from "./auth.controller.js";

const router = express.Router();

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);

export default router;

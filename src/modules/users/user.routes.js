import express from "express";
import { getUser } from "./user.controller.js";
// import { celebrate, Joi }  from "celebrate"
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();
// Routes
router.get("/user", authMiddleware, getUser);
// router.get("/:id", userController.getUserById);
// router.put(
// "/:id",
// celebrate({
// body: Joi.object({
// name: Joi.string().min(3).optional(),
// email: Joi.string().email().optional(),
// }),
// }),
// userController.updateUser
// );

export default router;

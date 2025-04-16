import express from "express";
import { getUser, getUsers } from "./user.controller.js";
// import { celebrate, Joi }  from "celebrate"
import { authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();
// Routes
router.get("/user", getUser);
router.get("/", authorize("admin"), getUsers);

export default router;

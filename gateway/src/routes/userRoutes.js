import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getUserData } from "../controllers/userController.js";

const userRouter = Router();


userRouter.get('/getUserData', authMiddleware, getUserData);

export default userRouter;
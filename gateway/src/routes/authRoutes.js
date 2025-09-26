import express from "express"
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerificationOtp, verifyEmail } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', authMiddleware, logout);
authRouter.post('/send-verification-otp', authMiddleware, sendVerificationOtp);
authRouter.post('/verify-email', authMiddleware, verifyEmail);
authRouter.get('/is-authenticated', authMiddleware, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;
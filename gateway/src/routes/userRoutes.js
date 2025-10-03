import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { analyzeEyeDisease, analyzeSkinDisease, checkReportStatus, downloadReport, getUserData, getUserHistory, monitorWound } from "../controllers/userController.js";
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const userRouter = Router();


userRouter.get('/getUserData', authMiddleware, getUserData);
userRouter.post('/skinAnalyze', authMiddleware, upload.single('image'), analyzeSkinDisease);
userRouter.post('/eyeAnalyze', authMiddleware, upload.single('image'), analyzeEyeDisease);
userRouter.post('/woundMonitor', authMiddleware, upload.single('image'), monitorWound);
userRouter.get('/checkReportStatus/:id', authMiddleware, checkReportStatus);
userRouter.get('/downloadReport/:id', authMiddleware, downloadReport);
userRouter.get('/getUserHistory', authMiddleware ,getUserHistory);

export default userRouter;
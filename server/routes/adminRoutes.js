import express from "express";
import { getConfig, updateConfig, getStats } from "../controllers/adminController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/config", getConfig);
router.post("/config", authMiddleware, adminMiddleware, updateConfig);
router.get("/stats", authMiddleware, adminMiddleware, getStats);

export default router;

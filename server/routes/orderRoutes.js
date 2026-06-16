import express from "express";
import { getOrders, placeOrder, updateOrderStatus, cancelOrder } from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getOrders);
router.post("/", placeOrder);
router.put("/:id/status", adminMiddleware, updateOrderStatus);
router.put("/:id/cancel", cancelOrder);

export default router;

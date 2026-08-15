import express from "express";

import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder } from "../controllers/orderController.js";
import { saveOrderMenu, getOrderMenu } from "../controllers/orderMenuController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

router.put("/:orderId/menu", saveOrderMenu);
router.get("/:orderId/menu", getOrderMenu);

export default router;

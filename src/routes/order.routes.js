import { Router } from "express";
import { placeOrder, validateOrder, updatePaymentStatus, getUserOrders, getOrderById, updateOrderStatus } from "../controllers/order.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/placeOrder").post(verifyJWT, placeOrder);
router.route("/validateOrder").post(verifyJWT, validateOrder);
router.route("/updatePaymentStatus/:orderId").patch(verifyJWT, updatePaymentStatus);
router.route("/userOrders").get(verifyJWT, getUserOrders);
router.route("/orderById/:orderId").get(verifyJWT, getOrderById);
router.route("/updateOrderStatus/:orderId").patch(verifyJWT, updateOrderStatus);

export default router ; 
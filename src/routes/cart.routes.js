import { Router } from "express";
import {
    addItem,
    removeItem,
    getUserCart,
    updateProductQuantity,
    clearCart
} from "../controllers/cart.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/addItem").post(verifyJWT, addItem)
router.route("/removeItem").patch(verifyJWT, removeItem)
router.route("/userCart").get(verifyJWT, getUserCart)
router.route("/updateProductQuantity/:updateBy").patch(verifyJWT, updateProductQuantity)
router.route("/clearCart").patch(verifyJWT, clearCart)

export default router ;
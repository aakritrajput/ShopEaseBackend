import { Router } from "express";
import {
    addToWishlist,
    removeFromWishlist,
    getUserWishlist,
    emptyWishlist
} from "../controllers/wishlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/addToWishlist/:productId").patch(verifyJWT, addToWishlist);
router.route("/removeFromWishlist/:productId").patch(verifyJWT, removeFromWishlist);
router.route("/userWishlist").get(verifyJWT, getUserWishlist)
router.route("/emptyWishlist").patch(verifyJWT, emptyWishlist)

export default router ;
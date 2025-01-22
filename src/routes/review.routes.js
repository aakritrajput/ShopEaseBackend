import { Router } from "express";
import {
    addReview,
    editReview,
    deleteReview,
    getProductReviews
} from "../controllers/review.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/addReview/:productId").post(verifyJWT, addReview)
router.route("/editReview/:productId").patch(verifyJWT, editReview)
router.route("/deleteReview/:productId").delete(verifyJWT, deleteReview)
router.route("/productReviews/:productId").get(verifyJWT, getProductReviews)

export default router ;
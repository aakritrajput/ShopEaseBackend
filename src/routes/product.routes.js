import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addProduct } from "../controllers/product.controller.js";

const router = Router();

router.route("/addProduct").post(verifyJWT , upload.array('images', 7), addProduct)

export default router ;
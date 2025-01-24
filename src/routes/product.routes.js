import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addProduct,  updateStock , deleteProduct, searchProduct, getAllProducts, getSellersAllProducts, getProduct, updateProductDetails } from "../controllers/product.controller.js";

const router = Router();

router.route("/addProduct").post(verifyJWT , upload.array('images', 7), addProduct);
router.route("/updateStock/:productId").patch(verifyJWT, updateStock);
router.route("/deleteProduct/:productId").delete(verifyJWT, deleteProduct);
router.route("/searchProduct").get(verifyJWT, searchProduct);
router.route("/allProducts").get(verifyJWT, getAllProducts);
router.route("/sellersAllProducts/:sellerId").get(verifyJWT, getSellersAllProducts);
router.route("/:productId").get(verifyJWT, getProduct);
router.route("/updateProductDetails/:productId").patch(verifyJWT, updateProductDetails);

export default router ;
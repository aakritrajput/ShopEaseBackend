import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createCategory, deleteCategory } from "../controllers/category.controller";

const router = Router();
router.route("/createCategory").post(verifyJWT, createCategory);
router.route("/deleteCategory/:categoryId").delete(verifyJWT, deleteCategory); 

export default router ;
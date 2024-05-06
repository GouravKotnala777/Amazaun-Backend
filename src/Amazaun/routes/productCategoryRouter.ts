import express from "express";
import { createProductCategory, daleteProductCategory, findProductCategory, updateProductCategory } from "../controllers/productCategoryController";

const router = express.Router();

router.route("/new").post(createProductCategory);
router.route("/:productCategoryID").get(findProductCategory)
                                .put(updateProductCategory)
                                .delete(daleteProductCategory);

export default router;
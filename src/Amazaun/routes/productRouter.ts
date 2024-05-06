import express from "express";
import { addToWishlist, createProduct, createReview, deleteProduct, findMyWishlist, getAllProducts, getAllProductsCategories, getSingleProduct, updateProduct } from "../controllers/productController";
import { isUserAuthenticated } from "../middlewares/auth";
import { upload } from "../middlewares/multer.middleware";

const app = express.Router();

app.route("/all").post(getAllProducts);
app.route("/new").post(upload.single("photo"), createProduct);
app.route("/review").post(isUserAuthenticated, createReview);
app.route("/group/:groupedBy").get(getAllProductsCategories);
app.route("/wishlist").get(isUserAuthenticated, findMyWishlist)
                    .post(isUserAuthenticated, addToWishlist);
app.route("/:productID").get(getSingleProduct)
                    .put(isUserAuthenticated, upload.single("photo"), updateProduct)
                    .delete(deleteProduct);

export default app;
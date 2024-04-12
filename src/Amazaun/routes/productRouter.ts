import express from "express";
import { addToWishlist, createProduct, createReview, deleteProduct, getAllProducts, getAllProductsWithSearchedQueries, getSingleProduct, updateProduct } from "../controllers/productController";
import { isUserAuthenticated } from "../middlewares/auth";
import { upload } from "../middlewares/multer.middleware";

const app = express.Router();

app.route("/all").get(getAllProducts)
                .post(getAllProductsWithSearchedQueries);
app.route("/new").post(upload.single("photo"), createProduct);
app.route("/review").post(isUserAuthenticated, createReview);
app.route("/wishlist").post(isUserAuthenticated, addToWishlist);
app.route("/:productID").get(getSingleProduct)
                    .put(updateProduct)
                    .delete(deleteProduct);

export default app;
import express from "express";
import { createCartProducts, deleteCartProducts, getAllCartProducts, getMyCartProducts, getSingleCartProduct, removeCartProducts} from "../controllers/cartController";
import { isUserAuthenticated } from "../middlewares/auth";

const app = express.Router();

app.route("/all").get(getAllCartProducts);
app.route("/add").post(isUserAuthenticated, createCartProducts);
app.route("/remove").delete(isUserAuthenticated, removeCartProducts);
app.route("/mycart").get(isUserAuthenticated, getMyCartProducts);
app.route("/:cartID").get(getSingleCartProduct);
app.route("/:productID")
                    .delete(deleteCartProducts);

export default app;
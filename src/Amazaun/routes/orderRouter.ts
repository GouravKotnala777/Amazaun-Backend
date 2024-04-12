import express from "express";
import { createOrder, getAllOrders, getMyOrders } from "../controllers/orderController";
import { isUserAuthenticated } from "../middlewares/auth";

const router = express.Router();

router.route("/all").get(isUserAuthenticated, getAllOrders);
router.route("/new").post(isUserAuthenticated, createOrder);

router.route("/").get(isUserAuthenticated, getMyOrders);


export default router;
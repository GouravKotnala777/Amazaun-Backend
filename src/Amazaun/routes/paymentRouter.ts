import express from "express";
import { createPayment, createPaymentNew } from "../controllers/paymentController";


const app = express.Router();

app.route("/new").post(createPayment);
app.route("/new2").post(createPaymentNew);

export default app;

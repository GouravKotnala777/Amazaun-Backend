import express from "express";
import {config} from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDatabase from "./Amazaun/config/db";
import userRoute from "./Amazaun/routes/userRouter";
import productRoute from "./Amazaun/routes/productRouter";
import cartRoute from "./Amazaun/routes/cartRouter";
import paymentRoute from "./Amazaun/routes/paymentRouter";
import orderRoute from "./Amazaun/routes/orderRouter";
import { errorMiddleware } from "./Amazaun/middlewares/errorMiddleware";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser"
import Stripe from "stripe";
// import Stripe from "stripe";


config({
    path:"./.env"
});

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "";
const STRIPE_KEY = process.env.STRIPE_KEY || "";

connectDatabase(MONGO_URI);

export const stripe = new Stripe(STRIPE_KEY);

const app = express();

app.use(cors({
    origin:[
        'http://127.0.0.1:5173',
        'https://amazaun-frontend-12313.vercel.app'
    ],
    credentials: true
}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));


app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/order", orderRoute);
app.get("/api/v1/test", (req, res) => {
    res.status(200).json({success:true, message:"API is working"})
})

app.use(errorMiddleware);


app.listen(PORT, () => {    
    console.log("listening....");
});
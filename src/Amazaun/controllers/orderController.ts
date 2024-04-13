import { NextFunction, Request, Response } from "express";
import Order from "../models/orderModel";
import ErrorHandler from "../utils/utility-class";
import { AuthenticatedRequest } from "../middlewares/auth";


export const getAllOrders = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const orders = await Order.find().populate({model:"Product", path:"orderItems.product", select:"name price photo"}).populate({model:"User", path:"user", select:"name email"});;

        if (!orders) return next(new ErrorHandler("No order exists", 400));

        return res.status(201).json({success:true, message:orders});
    } catch (error) {
        console.log(error);
        return res.status(402).json({success:false, message:error});
    }
};
export const createOrder = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedRequest)?.user?._id;
        const {quantity, productID, status, message} = req.body;

        const isUserOrderExists = await Order.findOne({user:userID});

        if (isUserOrderExists) {
            isUserOrderExists.orderItems.push({
                product:productID,
                quantity:quantity,
                paymentInfo:{
                    transactionId:"Demo Transaction ID",
                    status:status,
                    message:message
                }
            });

            await isUserOrderExists.save();
        }
        else{
            const newOrder = await Order.create({
                orderItems:[{
                    product:productID,
                    quantity:quantity,
                    paymentInfo:{
                        transactionId:"Demo Transaction ID",
                        status:status
                    }
                }],
                user:userID,
            });
        }
        
        

        // if (!newOrder)  return next(new ErrorHandler("New Order Failed", 400));

        res.status(200).json({success:false, message:"Order successfull"});        
    } catch (error) {
        console.log(error);
        res.status(402).json({success:false, message:error});        
    }
};
export const getMyOrders = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const order = await Order.findOne({user:(req as AuthenticatedRequest).user._id}).populate({model:"Product", path:"orderItems.product", select:"name price photo"});

        if (!order) return next(new ErrorHandler("Order not found", 404));

        return res.status(201).json({success:true, message:order});
    } catch (error) {
        console.log(error);
        return res.status(402).json({success:false, message:error});
    }
};











// export const getAllOrders = async(req:Request, res:Response, next:NextFunction) => {
//     try {
        
//     } catch (error) {
//         console.log(error);
//         res.status(402).json({success:false, message:error});        
//     }
// };
// export const getAllOrders = async(req:Request, res:Response, next:NextFunction) => {
//     try {
        
//     } catch (error) {
//         console.log(error);
//         res.status(402).json({success:false, message:error});        
//     }
// };
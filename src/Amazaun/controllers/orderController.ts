import { NextFunction, Request, Response } from "express";
import Order from "../models/orderModel";
import ErrorHandler from "../utils/utility-class";
import { AuthenticatedRequest } from "../middlewares/auth";
import Product from "../models/productModel";

interface CheckoutAllDataTypes {
    product:string;
    quantity:number;
}

export const getAllOrders = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const orders = await Order.find().populate({model:"Product", path:"orderItems.productGrouped.product", select:"name price photo"}).populate({model:"User", path:"user", select:"name email"});

        console.log({orders});
        
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
        const {checkoutAllData, shippingType, subTotal, total, status, message}:{checkoutAllData:CheckoutAllDataTypes[]; shippingType:string; subTotal:number; total:number; status?:string; message?:string;} = req.body;

        const isUserOrderExists = await Order.findOne({user:userID});
        

        // console.log("YYYYYYYYYYYYYYYYY");
        // console.log({checkoutAllData, shippingType, status, message});
        // console.log("YYYYYYYYYYYYYYYYY");
        


        if (status !== "Failed") {
            checkoutAllData.forEach(async(item, index) => {
                const product = await Product.findById(item.product);
                if (product) {
                    await product.save();
                }
            });
        }

        if (isUserOrderExists) {
            // checkoutAllData.forEach((item) => {
                isUserOrderExists.orderItems.push({
                    productGrouped:[
                        ...checkoutAllData
                    ],
                    paymentInfo:{
                        transactionId:"Demo Transaction ID",
                        shippingType,
                        subTotal,
                        total,
                        status,
                        message
                    }
                });
            // })

            await isUserOrderExists.save();
        }
        else{
            // checkoutAllData.forEach(async(item) => {
            const newOrder = await Order.create({
                    orderItems:[{
                        productGrouped:[
                            ...checkoutAllData
                        ],
                        paymentInfo:{
                            transactionId:"Demo Transaction ID",
                            shippingType,
                            subTotal,
                            total,
                            status:status,
                            message:message
                        }
                    }],
                    user:userID,
                });
            // });
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
        const order = await Order.findOne({user:(req as AuthenticatedRequest).user._id}).populate({model:"Product", path:"orderItems.productGrouped.product", select:"name price photo"});

        if (!order) return next(new ErrorHandler("Order not found", 404));

        return res.status(201).json({success:true, message:order});
    } catch (error) {
        console.log(error);
        return res.status(402).json({success:false, message:error});
    }
};
// export const getSingleOrders = async(req:Request, res:Response, next:NextFunction) => {
//     try {
//         const {customerID, orderID} = req.body;
//         console.log({customerID, orderID});
        

//         if (!customerID) return next(new ErrorHandler("Invalid orderID", 400));
//         if (!orderID) return next(new ErrorHandler("Invalid customerID", 400));
        
//         const order = await Order.findById(customerID).populate({model:"Product", path:"orderItems.product", select:"name price photo"}).populate({model:"User", path:"user", select:"name email"});
//         if (!order) return next(new ErrorHandler("Order not found", 400));
        
//         const findResultOrder = order.orderItems.find((order) => order._id?.toString() === orderID);
//         if (!findResultOrder) return next(new ErrorHandler("something wrong in findResultOrder orderController.ts", 400));
        
        
//         console.log("&&&&&&&&&&&&&&&&");
//         console.log(findResultOrder);
//         console.log("&&&&&&&&&&&&&&&&");
        
        
//         return res.status(200).json({success:true, message:findResultOrder});
//     } catch (error) {
//         console.log(error);
//         return res.status(402).json({success:false, message:error});
//     }
// };











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
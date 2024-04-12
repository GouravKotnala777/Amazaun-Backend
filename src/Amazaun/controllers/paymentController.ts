import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class";
import { stripe } from "../../app";
import { v4 as uuidv4 } from 'uuid';



export const createPaymentNew = async(req:Request, res:Response, next:NextFunction) => {

    const {product, token} = req.body;

    if (!product) return next(new ErrorHandler("Invalid product", 401));
    if (!token) return next(new ErrorHandler("Invalid token", 401));

    const idempotencyKey = uuidv4();

    console.log(product.price);
    console.log(product.name);
    

    return stripe.customers.create({
        email:token.email,
        source:token.id,
    }).then((customer) => {
        stripe.charges.create({
            amount:Number(product.price) * 100,
            currency:"usd",
            customer:customer.id,
            receipt_email:token.email,
            description:product.name,
            shipping:{
                name:token.card.name,
                address:{
                    country:token.card.address_country
                }
            }
        }, {idempotencyKey})
    }).then((result) => res.status(200).json({success:true, message:result}))
    .catch(err => console.log(err))
};








export const createPayment = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {amount} = req.body;

        if (!amount) return next(new ErrorHandler("Invalid amount", 401));

        const paymentIntent = await stripe.paymentIntents.create({
            amount:Number(amount)*100,
            currency:"inr"
        });

        res.status(201).json({success:true, message:paymentIntent.client_secret})
    } catch (error) {
        next(error);
    }
};
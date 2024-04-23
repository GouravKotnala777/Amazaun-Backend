import { NextFunction, Request, Response } from "express";
import Cart from "../models/cartModel";
import ErrorHandler from "../utils/utility-class";
import { AuthenticatedRequest } from "../middlewares/auth";

interface CartItemsTypes {
    product: string;
    quantity:number;
};

interface CartTypes {
    cartItems:CartItemsTypes[];
    user:string;
    productID:string;
    quantity:number;
    image:string;
}

export const getAllCartProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        
        const cartProducts = await Cart.find();

        if (cartProducts.length === 0) return next(new ErrorHandler("No product exists", 400));

        res.status(200).json({success:true, message:cartProducts});
    } catch (error) {
        next(error);
    }
};
export const getSingleCartProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {cartID} = req.params;
        if (!cartID) return (next(new ErrorHandler("CartID not found", 404)));

        const cartProduct = await Cart.findById(cartID);
        if (!cartProduct) return (next(new ErrorHandler("Cart not found", 404)));

        res.status(200).json({success:true, message:cartProduct});
    } catch (error) {
        next(error);
    }
};
export const getMyCartProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const cartProduct = await Cart.findOne({user:(req as AuthenticatedRequest).user._id}).populate({path:"cartItems.product", model:"Product", select:"_id name price photo"});

        console.log(cartProduct);
        
        if (!cartProduct) return (next(new ErrorHandler("Cart Product not found", 404)));

        res.status(200).json({success:true, message:cartProduct});
    } catch (error) {
        next(error);
    }
};
export const createCartProducts = async(req:Request<{}, {}, CartTypes>, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedRequest).user._id;
        // console.log({userID});
        
        const {quantity, productID} = req.body;
        // console.log({productID});
        
        const cartProduct = {
            product:productID,
            quantity:quantity
        }
        

        const isCartProductExist = await Cart.findOne({user:userID});

        if (!isCartProductExist) {
            const cart = await Cart.create({user:userID, cartItems:[cartProduct]});
            console.log({cart});
            
        }
        else{
            const findResult = isCartProductExist.cartItems.find(q => q.product?.toString() === productID);
            console.log({findResult});
            
            if (findResult) {
                console.log("pahle se hai");
                
                isCartProductExist.cartItems.forEach((q) => {
                    if (q.product?.toString() === productID) {
                        q.quantity = q.quantity + quantity;
                    }
                });
                
                await isCartProductExist.save();
            }
            else{
                console.log("nahi tha");
                
                isCartProductExist.cartItems.push(cartProduct);
                await isCartProductExist.save();
            }
        }
        
        res.status(200).json({success:true, message:"Product added to cart"});
    } catch (error) {
        next(error);
    }
};
export const removeCartProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedRequest).user._id;
        const {quantity, productID} = req.body;

        const cartProduct = await Cart.findOne({user:userID});

        if (!cartProduct) return (next(new ErrorHandler("Cart Product not found", 404)));

        const findResult = cartProduct.cartItems.find(product => product.product?.toString() === productID);
        const filterResult = cartProduct.cartItems.filter(product => product.product?.toString() !== productID);

        if (findResult) {
            if (findResult.quantity > quantity) {
                findResult.quantity = findResult.quantity - quantity;
                cartProduct.cartItems = [...filterResult, findResult];
            }
            else if(findResult.quantity === quantity) {
                cartProduct.cartItems = filterResult;
            }
            else{
                return(next(new ErrorHandler("Don't have that much products in cart", 402)));
            }
            await cartProduct.save();
        }        
        res.status(200).json({success:true, message:"Cart Product removed"});
    } catch (error) {
        next(error);
    }
};
export const clearCartAfterCheckout = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedRequest).user._id;
        const {checkoutAllData}:{checkoutAllData:CartItemsTypes[]} = req.body;

        if (!userID) return(next(new ErrorHandler("Login First", 402)));
        if (checkoutAllData.length === 0) return(next(new ErrorHandler("checkoutAllData is undefined or empty array", 402)));
        
        console.log({checkoutAllData});
        
        const myCart = await Cart.findOne({user:(req as AuthenticatedRequest).user._id});
        
        if (!myCart) return(next(new ErrorHandler("Cart Not found", 402)));

        const uniqueProducts = myCart.cartItems.filter(obj1 => !checkoutAllData.some(obj2 => obj2.product === obj1.product.toString()));

        console.log({uniqueProducts});
        
        myCart.cartItems = uniqueProducts;

        await myCart.save();

        return res.status(200).json({success:true, message:"Cart has cleared"});
    } catch (error) {
        next(error);
    }
};
export const deleteCartProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {userID, productID} = req.params;
        const {quantity} = req.body;
        const isOrdeExist = await Cart.findOne({user:userID});
        const orderedProduct = {
            product:productID,
            quantity:quantity,
            image:"image demo"
        }

        if (!isOrdeExist) {
            const order = await Cart.create({user:userID, orderItems:[orderedProduct]});
        }
        else{
            isOrdeExist.cartItems.push(orderedProduct);
            await isOrdeExist.save();
        }
        
        res.status(200).json({success:true, message:"Cart Product deleted successfully"});
    } catch (error) {
        next(error);
    }
};
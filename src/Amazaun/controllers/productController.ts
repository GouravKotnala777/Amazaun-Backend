import { NextFunction, Request, Response } from "express";
import Product from "../models/productModel";
import ErrorHandler from "../utils/utility-class";
import { AuthenticatedRequest } from "../middlewares/auth";
import { uploadOnCloudinary } from "../utils/cloudinary.util";
import apiFeatures, { APIFeaturesTypes } from "../utils/api-features";
import User from "../models/userModel";

interface CreateProductBodyTypes {
    productType:string;
    name:string;
    price:number;
    stock:number;
    photo:string;
};

export const createProduct = async(req:Request<{}, {}, CreateProductBodyTypes>, res:Response, next:NextFunction) => {
    try {
        const {productType, name, price, stock} = req.body;

        if (!productType || !name || !price || !stock) return next(new ErrorHandler("All fields are required", 400));

        const isProductExist = await Product.findOne({productType, name, price});

        if (isProductExist) return next(new ErrorHandler("Product is already exists", 409));
        
        if (!req.file?.path) return next(new ErrorHandler("Photo file not found", 404));

        const photo = await uploadOnCloudinary(req.file.path, "Products");

        console.log({productType, name, price, stock, photo});

        if (!photo) return next(new ErrorHandler("Photo is not uploaded to cloudinary", 500));

        const product = await Product.create({productType, name, price, stock, photo:photo.secure_url});

        if (!product) return next(new ErrorHandler("Something went wrong at createProduct controller", 500));

        res.status(200).json({success:true, message:"Product created successfully"});        
    } catch (error) {
        next(error);
    }
};
export const getAllProducts = async(req:Request<{}, {}, {productType:string|undefined; name:string|undefined;}, {skipProducts:number}>, res:Response, next:NextFunction) => {
    try {

        const {skipProducts} = req.query;
        const {productType, name} = req.body;

        console.log({skipProducts});


        const products = await Product.find({
            productType:{
                $regex:productType?productType:"",
                $options:"i"
            },
            name:{
                $regex:name?name:"",
                $options:"i"
            }
        }).skip(skipProducts*6).limit(6);
        
        // const products = await Product.find().skip(skipProducts*6).limit(6);

        if (products.length === 0) return next(new ErrorHandler("No product exists", 400));
        console.log(products);
        

        res.status(200).json({success:true, message:products});
    } catch (error) {
        next(error);
    }
};
export const getSingleProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.params;

        if (!productID) return next(new ErrorHandler("ProductID not found", 404));

        const product = await Product.findById(productID).populate({path:"reviews.user", model:"User", select:"name email avatar"});

        if (!product) return next(new ErrorHandler("Product not found", 404));

        res.status(200).json({success:true, message:product});
    } catch (error) {
        next();
    }
};
export const updateProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.params;
        const {productType, name, price, stock} = req.body;

        if (!productID) return next(new ErrorHandler("ProductID not found", 400));


        const product = await Product.findByIdAndUpdate(productID,
            {...(productType && {productType}),
            ...(name && {name}),
            ...(price && {price}),
            ...(stock && {stock})}
        );

        if (!product) return next(new ErrorHandler("Product not found", 400));

        res.status(200).json({success:true, message:"Product updated successfully"});
    } catch (error) {
        next(error);
    }
};
export const deleteProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.params;

        if (!productID) return next(new ErrorHandler("ProductID not found", 400));

        const product = await Product.findByIdAndDelete(productID);

        if (!product) return next(new ErrorHandler("Product not found", 400));

        res.status(200).json({success:true, message:"Product deleted successfully"});
    } catch (error) {
        next(error);
    }
};
export const createReview = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedRequest).user._id;
        const {productID, rating, comment} = req.body;

        const product = await Product.findById(productID);

        console.log({reviews:product?.reviews});
        
        if (!product) return next(new ErrorHandler("Product not found", 404));

        
        
        console.log({userID});
        const findRevit = product.reviews.forEach((item) => {
            console.log({itemUserID:item.user});
        });
        const findReviewResult = product.reviews.find(item => item.user?.toString() === userID.toString());
        
        console.log({findReviewResult});
        
        if (!findReviewResult) {
            console.log("Review pahle nahi tha");
            console.log({user:userID, rating, comment});
            product.reviews.push({user:userID, rating, comment});
        }
        else{
            console.log("Review pahle tha");

            product.reviews.forEach((r) => {
                if (r.user?.toString() === userID.toString()) {
                    r.rating = rating;
                    r.comment = comment;
                }
            })
            // const filterReviewResult = product.reviews.filter(item => item._id !== userID.toString());
            // filterReviewResult.push(findReviewResult);
            // product.reviews = filterReviewResult;
        }
        
        await product.save();


        return res.status(200).json({success:true, message:"Review created successfully"});
        
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const addToWishlist = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.body;

        if (!productID) return next(new ErrorHandler("ProductID not found", 404));
        
        const product = await Product.findById(productID);

        if (!product) return next(new ErrorHandler("Product not found", 404));

        const user = await User.findById((req as AuthenticatedRequest).user._id);

        if (!user) return next(new ErrorHandler("Login first", 404));

        // console.log({user:user?.wishlistedProducts});
        

        const wishlistedUserFindResult = product.wishlistedUsers.find(user => user.toString() === (req as AuthenticatedRequest).user._id.toString());

        
        if (wishlistedUserFindResult) {
            const wishlistedUserFilterResult = product.wishlistedUsers.filter(user => user.toString() !== (req as AuthenticatedRequest).user._id.toString());
            const wishlistedProductsFilterResult = user.wishlistedProducts?.filter(product => product.toString() !== productID.toString());
            
            product.wishlistedUsers = wishlistedUserFilterResult;
            user.wishlistedProducts = wishlistedProductsFilterResult;
            await product.save();
            await user.save();
            
            return res.status(201).json({success:true, message:product, message2:"Removed from wishlist"});
        }
        else{
            product.wishlistedUsers.push((req as AuthenticatedRequest).user._id);
            user.wishlistedProducts?.push(productID);
            await product.save();
            await user.save();
            
            return res.status(201).json({success:true, message:product, message2:"Added to wishlist"});
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const findMyWishlist = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = await User.findById((req as AuthenticatedRequest).user._id).populate({model:"Product", path:"wishlistedProducts", select:"name price photo "});

        if (!user) return next(new ErrorHandler("user not found", 404));

        return res.status(201).json({success:true, message:user.wishlistedProducts});
    } catch (error) {
        next(error);
    }
};











// nahi use ho raha sayad
export const getAllReview = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.body;
        const product = await Product.findById(productID);

        if (!product) return next(new ErrorHandler("Product not found", 404));

        return res.status(200).json({success:true, message:product.reviews});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
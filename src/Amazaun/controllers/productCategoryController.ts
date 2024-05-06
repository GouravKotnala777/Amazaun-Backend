import { NextFunction, Request, Response } from "express";
import productCategoryModel from "../models/productCategoryModel";
import ErrorHandler from "../utils/utility-class";


export const createProductCategory = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {category, what, role, benefits, usage, caution, photo} = req.body;

        const productCategory = await productCategoryModel.create({
            category,
            what,
            role,
            benefits,
            usage,
            caution,
            photo
        });

        if (!productCategory) return next(new ErrorHandler("ProductCategory not created", 500));

        res.status(200).json({success:true, message:"Product Category created successfully"});
    } catch (error) {
        next(error);
    }
};
export const findProductCategory = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {category} = req.body;

        if (!category) return next(new ErrorHandler("Category not created", 402));
        
        const productCategory = await productCategoryModel.findOne({category});
        
        if (!productCategory) return next(new ErrorHandler("ProductCategory not created", 402));

        res.status(200).json({success:true, message:productCategory});
    } catch (error) {
        next(error);
    }
};
export const updateProductCategory = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productCategoryID} = req.params;

        if (!productCategoryID) return next(new ErrorHandler("ProductCategoryID not created", 500));

        const productCategory = await productCategoryModel.findById(productCategoryID);

        if (!productCategory) return next(new ErrorHandler("ProductCategory not created", 500));

        res.status(200).json({success:true, message:"ProductCategory updated successfully"});
    } catch (error) {
        next(error);
    }
};
export const daleteProductCategory = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productCategoryID} = req.params;

        if (!productCategoryID) return next(new ErrorHandler("ProductCategoryID not created", 402));

        const productCategory = await productCategoryModel.findByIdAndDelete(productCategoryID);

        res.status(200).json({success:true, message:"ProductCategory deleted successfully"});
    } catch (error) {
        next(error);
    }
};
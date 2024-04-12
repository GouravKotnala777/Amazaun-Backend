import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class";


export const errorMiddleware = (err:ErrorHandler, req:Request, res:Response, next:NextFunction) => {
    
    err.message ||= "Internal Server Error....";
    err.statusCode ||= 500;

    // if (err.message === "CastError") err.message = "Invalid mongoose Id";

    console.log("===============");
    console.log(err.message);
    console.log(err.statusCode);
    console.log("===============");

    return res.status(err.statusCode).json({success:false, message:err.message})
};
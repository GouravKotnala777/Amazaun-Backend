import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class";
import User, { UserDocument } from "../models/userModel";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user:UserDocument;
};

export const isUserAuthenticated = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        console.log({accessToken:req.cookies?.accessToken});
        console.log({accessTokenH:req.header("Authorization")?.replace("Bearer ", "")});
        
        if (!token) return next(new ErrorHandler("Unauthorized request", 401));
        
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret) as JwtPayload;
                
        if (!verifiedToken) return next(new ErrorHandler("no verifiedToken from auth.ts", 401));
    
        const user = await User.findById(verifiedToken._id).select("-password -refreshToken");
    
        if (!user) return next(new ErrorHandler("Invalid Access Token", 401));
        
        (req as AuthenticatedRequest).user = user;
        next();
    } catch (error:any) {
        if (error.message === "jwt expired") {
            return res.status(401).json({success:false, message:error.message});
        }
        else{
            return res.status(401).json({success:false, message:"Error from auth catch"});
        }
    }
};


export const isUserAdmin = async(req:Request, res:Response, next:NextFunction) => {
    if (res.locals.user.role !== "admin") return next(new ErrorHandler("Only admin can access this", 403));
    next();
};
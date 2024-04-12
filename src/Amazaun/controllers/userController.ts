import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import ErrorHandler from "../utils/utility-class";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../utils/cloudinary.util";
import { AuthenticatedRequest } from "../middlewares/auth";
import { options } from "../utils/utilitie-variables";

interface RegisterBodyTypes {
    name?:string;
    email?:string;
    password?:string;
    mobile?:string;
    role?:string;
    avatar?:string;
};

interface RegisterFilesTypes {
    avatar:Express.Multer.File[];
};


const generateAccessAndRefreshToken = async(userID:string) => {
    try {
        const user = await User.findById(userID);
        if (user) {
            const refreshToken = user.generateRefreshToken();
            const accessToken = user.generateAccessToken();

            user.refreshToken = refreshToken;
            await user.save({validateBeforeSave:false});
            return {accessToken, refreshToken};
        }
        return {accessToken:"", refreshToken:""};
    } catch (error) {
        console.log(error);
        return {accessToken:"error from generateAccessAndRefreshToken", refreshToken:"error from generateAccessAndRefreshToken"};
    }
};


export const createUser = async(req:Request, res:Response, next:NextFunction) => {
    try {        
        const {name, email, password, mobile, role} = req.body;

        if (!name || !email || !password || !mobile) return next(new ErrorHandler("All fields are required", 402));
        
        const isUserExist = await User.findOne({email});
        
        if (isUserExist) return next(new ErrorHandler("User already exists", 402));
        
        console.log({"req.file?.path":req.file?.path});
        console.log({"req.file":req.file});
        console.log({"req.files":req.files});
        
        
        if (!req.file?.path) return next(new ErrorHandler("Avatar file not found", 500));
        
        const avatar = await uploadOnCloudinary(req.file?.path!, "Avatars");

        console.log({
            name, email, password, mobile, avatar, role
        });
        
        const user = await User.create({
            name, email, password, mobile, avatar:avatar?.secure_url, role
        });
        
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) return next(new ErrorHandler("Something went wrong while registering user", 500));

        return res.status(200).json({success:true, message:"User created successfully"});
    } catch (error) {
        next(error);
    }
};
export const login = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password} = req.body;        
        
        if (!email || !password) return next(new ErrorHandler("All fields are required", 402));
        
        const isUserExist = await User.findOne({email});
        
        if (!isUserExist) return next(new ErrorHandler("Wrong email or password", 402));
        
        const isPasswordMatched:boolean = await isUserExist.isPasswordCorrect(password);
        
        if (!isPasswordMatched) return next(new ErrorHandler("Wrong email or password", 401));

        const {accessToken, refreshToken}:{accessToken:string; refreshToken:string;} = await generateAccessAndRefreshToken(isUserExist._id);

        const loggedInUser = await User.findById(isUserExist._id).select("-password -refreshToken");

        return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json({success:true, message:loggedInUser, accessToken, refreshToken});
    } catch (error) {;
        next(error);
    }
};
export const logout = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const updateUser = await User.findByIdAndUpdate((req as AuthenticatedRequest).user._id, {refreshToken:undefined});

        res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({success:true, message:"Logout successfull"});
    } catch (error) {
        next(error);
    }
};
export const refreshAccessToken = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        console.log({incomingRefreshToken});
        

        if (!incomingRefreshToken) return res.status(401).json({success:false, message:"Unauthorized user from refreshAccessToken controller"});

        console.log("---------  (1)");
        
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as Secret) as JwtPayload;
        console.log("---------  (2)");
        
        const user = await User.findById(decodedToken._id);
        console.log("---------  (3)");
        
        if (!user) return res.json({success:false, message:"Invalid refresh token from refreshAccessToken controller"});
        console.log("---------  (4)");
        
        if (incomingRefreshToken !== user.refreshToken) return res.json({success:false, message:"Refresh token is expired or used from refreshAccessToken controller"});
        console.log("---------  (5)");

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

        return res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json({success:true, message:{accessToken, refreshToken}})
    } catch (error) {
        console.log(error);
        
        return res.status(400).json({success:false, message:"error from catch from refreshAccessToken"})
    }
};
export const getAllUsers = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const users = await User.find();
        // console.log(req.user);
        
        
        if (!users) return next(new ErrorHandler("No users exists", 403));
    
        return res.status(200).json({success:true, message:users});
    } catch (error) {
        next(error);
    }
};
export const loggedInUser = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const loggedInUser = (req as AuthenticatedRequest).user;
        res.status(201).json({success:true, message:loggedInUser});
    } catch (error) {
        res.status(401).json({success:false, message:"login first"})
    }
};





export const updateMyDetailes = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {_id} = (req as AuthenticatedRequest).user;
        const {name, password, mobile} = req.body;

        const user = await User.findById(_id);
        if (!user) return next(new ErrorHandler("User not found", 404));

        if (name){ user.name = name;}
        if (password){ user.password = password;}
        if (mobile){ user.mobile = mobile;}

        await user.save();
    
        return res.status(200).json({success:true, message:"User updated successfully"});
    } catch (error) {
        next(error);
    }
};
export const updateUser = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {userId} = req.params;
        const {name, password, mobile} = req.body;
    
        const user = await User.findByIdAndUpdate(userId,
            {...(name && {name}),
            ...(password && {password}),
            ...(mobile && {mobile})}
            );
    
        if (!user) return next(new ErrorHandler("User not found", 404));
    
        return res.status(200).json({success:true, message:"User updated successfully"});
    } catch (error) {
        next(error);
    }
};
export const deleteUser = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {userId} = req.params;
        const user = await User.findByIdAndDelete(userId);
    
        if (!user) return next(new ErrorHandler("User not found", 404));
    
        return res.status(200).json({success:true, message:"User deleted successfully"});
    } catch (error) {
        next(error);
    }
};
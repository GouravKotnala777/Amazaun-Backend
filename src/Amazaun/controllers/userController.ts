import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import ErrorHandler from "../utils/utility-class";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../utils/cloudinary.util";
import { AuthenticatedRequest } from "../middlewares/auth";
import { options } from "../utils/utilitie-variables";
import { sendEmail } from "../middlewares/mailer.middleware";
import { Types } from "mongoose";

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

        console.log("createUser-----  (1)");
        
        
        if (!name || !email || !password || !mobile) return next(new ErrorHandler("All fields are required", 402));
        console.log("createUser-----  (2)");
        
        const isUserExist = await User.findOne({email});
        console.log("createUser-----  (3)");
        
        if (isUserExist) return next(new ErrorHandler("User already exists", 402));
        console.log("createUser-----  (4)");
        
        // console.log({"req.file?.path":req.file?.path});
        // console.log({"req.file":req.file});
        // console.log({"req.files":req.files});
        
        
        if (!req.file?.path) return next(new ErrorHandler("Avatar file not found", 500));
        
        console.log("createUser-----  (5)");
        const avatar = await uploadOnCloudinary(req.file?.path!, "Avatars");
        console.log("createUser-----  (6)");
        
        // console.log({
            //     name, email, password, mobile, avatar, role
            // });
            
        const user = await User.create({
            name, email, password, mobile, avatar:avatar?.secure_url, role
        });
        console.log("createUser-----  (7)");
        
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        console.log("createUser-----  (8)");
        
        if (!createdUser) return next(new ErrorHandler("Something went wrong while registering user", 500));
        console.log("createUser-----  (9)");

        console.log("###############");
        await sendEmail({email, emailType:"REGISTER", userID:createdUser._id});
        console.log("###############");

        return res.json({success:true, message:"A verification link has sent to your email inbox"});
        // const {accessToken, refreshToken}:{accessToken:string; refreshToken:string;} = await generateAccessAndRefreshToken(createdUser._id);

        // return res.status(200)
        //         .cookie("accessToken", accessToken, options)
        //         .cookie("refreshToken", refreshToken, options)
        //         .json({success:true, message:"User created successfully"});
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


        if (isUserExist.isVarified === true) {            
            const {accessToken, refreshToken}:{accessToken:string; refreshToken:string;} = await generateAccessAndRefreshToken(isUserExist._id);
    
            const loggedInUser = await User.findById(isUserExist._id).select("-password -refreshToken");
    
            return res
                    .status(200)
                    .cookie("accessToken", accessToken, options)
                    .cookie("refreshToken", refreshToken, options)
                    .json({success:true, message:loggedInUser, accessToken, refreshToken});
        }
        else if (isUserExist.isVarified === false) {
            await sendEmail({email, emailType:"REGISTER", userID:isUserExist._id});
            return res.json({success:true, message:"verify first"});
        }
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
export const verifyEmail = async(req:Request, res:Response, next:NextFunction) => {
    try {
        let usera;
        let user;
        const {token, emailtype, newPassword} = req.body;
        console.log("========  (1)");

        if (emailtype === "REGISTER") {
            console.log("***********  (1)");
            
            usera = await User.findOne({verifyToken:token});
            console.log("***********  (2)");
            
            if (!usera?.verifyToken) return next(new ErrorHandler("verifyToken is undefined", 404));
            console.log("***********  (3)");
            
            user = await User.findOne({verifyToken:usera?.verifyToken, verifyTokenExpiry:{$gt:Date.now()}});
            console.log("***********  (4)");
            
            if (!user) return next(new ErrorHandler("user is undefined", 404));
            console.log("***********  (5)");
            
            
            const {accessToken, refreshToken}:{accessToken:string; refreshToken:string;} = await generateAccessAndRefreshToken(user._id);
            console.log("***********  (6)");
            
            
            user.isVarified = true;
            user.verifyToken = undefined;
            user.verifyTokenExpiry = undefined;
            console.log("***********  (7)");

            await user?.save();
            return res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json({success:true, message:"User created successfully"});
        }
        else if (emailtype === "VERIFY") {
            usera = await User.findOne({verifyToken:token});

            if (!usera?.verifyToken) return next(new ErrorHandler("verifyToken is undefined", 404));

            user = await User.findOne({verifyToken:usera?.verifyToken, verifyTokenExpiry:{$gt:Date.now()}});
            
            if (!user) return next(new ErrorHandler("user is undefined", 404));

            user.isVarified = true;
            user.verifyToken = undefined;
            user.verifyTokenExpiry = undefined;

            await user?.save();
    
            return res.status(200).json({success:true, message:"Email verified successfully"});
        }
        else if (emailtype === "RESET") {
            usera = await User.findOne({forgetPasswordToken:token});

            if (!usera?.forgetPasswordToken) return next(new ErrorHandler("forgetpassword token is undefined", 404));

            user = await User.findOne({forgetPasswordToken:usera?.forgetPasswordToken, forgetPasswordTokenExpiry:{$gt:Date.now()}});

            if (!user) return next(new ErrorHandler("user is undefined", 404));

            user.isVarified = true;
            user.password = newPassword;
            user.forgetPasswordToken = undefined;
            user.forgetPasswordTokenExpiry = undefined;
            await user?.save();
    
            return res.status(200).json({success:true, message:"Password changed successfully"});
        }

    } catch (error) {
        next(new ErrorHandler("error from verifyEmail controller catch", 404));
    }
};



export const forgetPasswordPre = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email} = req.body;
        console.log("^^^^^^^^  (1)");
        console.log({email});
        console.log("^^^^^^^^  (2)");
        if (!email) return (next(new ErrorHandler("userID or email not found", 402)));
        console.log("^^^^^^^^  (3)");
        
        const user = await User.findOne({email});
        if (!user) return (next(new ErrorHandler("User not found", 402)));
        
        await sendEmail({email, emailType:"RESET", userID:user._id});
        res.status(200).json({success:true, message:"forgetPasswordPre executed successfully"})
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
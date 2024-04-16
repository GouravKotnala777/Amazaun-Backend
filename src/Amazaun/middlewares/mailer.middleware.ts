import User from "../models/userModel";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import ErrorHandler from "../utils/utility-class";
import { Types } from "mongoose";



export const sendEmail = async({email, emailType, userID}:{email:string; emailType:string; userID:string|Types.ObjectId}) => {
    try {
        console.log("--------  (1)");
        console.log({email, emailType, userID});
        
        
        const hashedToken = await bcryptjs.hash(userID.toString(), 6);
        console.log("--------  (2)");
        console.log({hashedToken});
        
        
        if (emailType === "VERIFY") {
            console.log("--------  (3)");
            await User.findByIdAndUpdate(userID, {
                verifyToken:await hashedToken,
                verifyTokenExpiry:Date.now() + 90000
            });
            console.log("--------  (4)");
        }
        else if (emailType === "RESET") {
            const fBI = await User.findByIdAndUpdate(userID, {
                forgetPasswordToken:await hashedToken,
                forgetPasswordTokenExpiry:Date.now() + 90000
            });

            console.log({fBI});
        }
        console.log("--------  (5)");
        
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "2f681c5b51fc49",
                pass: "879ac374b7b424"
            }
        });
        console.log("--------  (6)");
        
        const mailOptions = {
            from:"gouravkotnala777@gmail.com",
            to:email,
            subject:emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html:`<p>Click <a href="http://127.0.0.1:5173/verifyemail?token=${hashedToken}&?emailtype=${emailType}"}>here</a> to ${emailType === "VERIFY" ? "Verify your email" : "Reset your password"} or copy this link http://127.0.0.1:5173/verifyemail?token=${hashedToken}&?emailtype=${emailType}</p>`
        };
        console.log("--------  (7)");
        
        const mailRes = await transporter.sendMail(mailOptions);
        console.log("--------  (8)");
        console.log({hashedToken});
        
        console.log("--------  (9)");

        return mailRes;
    } catch (error) {
        console.log(error);
        throw new ErrorHandler("Error from nodemailer catch", 500);
    }
};
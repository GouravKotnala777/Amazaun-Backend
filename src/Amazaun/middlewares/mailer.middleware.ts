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
        else if (emailType === "REGISTER") {
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
        
        // const transporter = nodemailer.createTransport({
        //     host: "sandbox.smtp.mailtrap.io",
        //     port: 2525,
        //     auth: {
        //         user: "2f681c5b51fc49",
        //         pass: "879ac374b7b424"
        //     }
        // });
        const transporter = nodemailer.createTransport({
            host:process.env.TRANSPORTER_HOST,
            port:Number(process.env.TRANSPORTER_PORT),
            secure:false,
            auth: {
                user: process.env.TRANSPORTER_ID,
                pass: process.env.TRANSPORTER_PASSWORD
            }
        });
        console.log("--------  (6)");
        
        const mailOptions = {
            from:process.env.TRANSPORTER_ID,
            to:email,
            subject:emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            // html:`<p>Click <a href="${process.env.SERVER_URI}/verifyemail?token=${hashedToken}&?emailtype=${emailType}"}>here</a> to ${emailType === "VERIFY" ? "Verify your email" : "Reset your password"} or copy this link ${process.env.SERVER_URI}/verifyemail?token=${hashedToken}&?emailtype=${emailType}</p>`
            html:
            `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .mail_cont{
                        border:2px solid red;
                        width:530px;
                        margin:20px auto;
                        padding:20px;
                        border-radius:8px;
                    }
                        .subject{
                    
                        }
                        .receiver{
                    
                        }
                        .mail_para{
                            text-align:justify;
                        }
                        .verify_link_cont{
                            margin:30px auto;
                            font-size:18px;
                            display:block;
                            text-align:center;
                        }
                            .verify_link_cont .verify_btn{
                                color:white;
                                border-radius:8px;
                                text-decoration:none;
                                padding:10px 30px;
                                background:linear-gradient(to bottom right, #ffb1be, #ff3153);
                            }
                            .verify_link_cont .verify_btn:hover{
                                background: #ffbcca;
                            }
                        .verify_uri{
                            margin:10px auto;
                            width:max-content;
                        }
                    
                </style>
            </head>
            <body>
                <div class="mail_cont>
                    <h3 class="subject">Subject: ${emailType === "VERIFY" ? "Please Verify Your Email Address" : "Please Verify Your Email To Change Password"}</h3>
                    <div class="receiver">Dear [User's Name],</div>
                    <div class="mail_para">
                        ${emailType === "VERIFY"||emailType === "REGISTER" ? "Thank you for registering with Amazaun! To ensure the security of your account and access all features, please verify your email address by clicking the link below:" : "To change your password first We need to verify it's you"}
                    </div>
                    <div class="verify_link_cont">
                        <a class="verify_btn" href="${process.env.SERVER_URI}/verifyemail?token=${hashedToken}&?emailtype=${emailType}">Verify</a>
                    </div>
                    <div class="verify_uri">URL :- ${process.env.SERVER_URI}/verifyemail?token=${hashedToken}&?emailtype=${emailType}</div>
                    <div class="mail_para">If you are unable to click the link above, please copy and paste it into your browser's address bar.</div>
                    <div class="mail_para">Once your email address is verified, you'll be able to [describe any benefits or features unlocked after verification].</div>
                    <div class="mail_para">If you did not create an account with Amazaun, please ignore this email.</div>
                    <div class="mail_para">Thank you,</div>
                    <div class="mail_para">The Amazaun Team</div>
                </div>
            </body>
        </html>`
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
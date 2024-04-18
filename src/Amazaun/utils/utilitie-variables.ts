import { CookieOptions } from "express";

export const options:CookieOptions = {
    expires: new Date(Date.now() + 604800000), // 7 days
    sameSite:"none",
    secure:true,
    httpOnly:true
};
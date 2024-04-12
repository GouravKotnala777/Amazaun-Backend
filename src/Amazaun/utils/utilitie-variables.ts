import { CookieOptions } from "express";

export const options:CookieOptions = {
    sameSite:"none",
    secure:true,
    httpOnly:true
};
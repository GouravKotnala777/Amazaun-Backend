import mongoose, { Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

interface Address {
    houseNo?: string;
    streetNo?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
};

export interface UserDocument extends Document {
    name: string;
    email: string;
    password: string;
    mobile: string;
    avatar?:string;
    role?: string;
    wishlistedProducts?: Types.ObjectId[];
    reviewedProducts?: Types.ObjectId[];
    address?: Address;
    refreshToken:string;


    isVarified?:boolean;
    forgetPasswordToken?:string;
    forgetPasswordTokenExpiry?:Date;
    verifyToken?:string;
    verifyTokenExpiry?:Date;


    isPasswordCorrect(password:string):Promise<boolean>;
    generateAccessToken():string;
    generateRefreshToken():string;
};






const userSchema = new mongoose.Schema<UserDocument>({
    name:{
        type:String,
        required:[true, "Name is required"],
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:[true, "Email is required"],
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:[true, "Password is required"]
    },
    mobile:{
        type:String,
        required:[true, "Mobile is required"]
    },
    avatar:{
        type:String
    },
    role:{
        type:String,
        enum:["user", "admin"],
        default:"user"
    },
    refreshToken:{
        type:String
    },



    isVarified:{type:Boolean, default:false},
    forgetPasswordToken:String,
    forgetPasswordTokenExpiry:Date,
    verifyToken:String,
    verifyTokenExpiry:Date,



    wishlistedProducts:[{
        type:mongoose.Schema.Types.ObjectId
    }],
    reviewedProducts:[{
        type:mongoose.Schema.Types.ObjectId
    }],
    address:{
        houseNo:{
            type:String
        },
        streetNo:{
            type:String
        },
        city:{
            type:String
        },
        State:{
            type:String
        },
        country:{
            type:String
        },
        zipCode:{
            type:String
        }
    }
},
{
    timestamps:true
}
);

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password!, 6);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password:string) {
    console.log(this.password);
    console.log(password);
    
    return await bcrypt.compare(password, this.password)
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {_id:this._id, name:this.name, email:this.email, role:this.role},
        process.env.ACCESS_TOKEN_SECRET as Secret,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {_id:this._id},
        process.env.REFRESH_TOKEN_SECRET as Secret,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY});
};


const userModel = mongoose.model<UserDocument>("User", userSchema);





export default userModel;
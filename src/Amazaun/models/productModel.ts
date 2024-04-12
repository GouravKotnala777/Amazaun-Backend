import mongoose, { Document, Schema } from "mongoose";



export interface ProductModelTypes extends Document {
    productType:string;
    name:string;
    price:number;
    ratings:number;
    stock:number;
    numOfReviews:number;
    photo:string; 
    createdBy:Schema.Types.ObjectId;
    reviews:{
        user:Schema.Types.ObjectId;
        rating:number;
        comment:string;
    }[],
    wishlistedUsers:Schema.Types.ObjectId[]
}

const productSchema = new mongoose.Schema<ProductModelTypes>({
    productType:String,
    name:String,
    price:Number,
    ratings:Number,
    stock:Number,
    numOfReviews:Number,
    photo:String, 
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    reviews:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        rating:Number,
        comment:String
    }],
    wishlistedUsers:[
        mongoose.Schema.Types.ObjectId
    ]
});

const productModel = mongoose.model<ProductModelTypes>("Product", productSchema);

export default productModel;
import { Document, Model, Schema } from "mongoose";
import { ProductModelTypes } from "../models/productModel";

export interface APIFeaturesTypes extends Document {
    category:string;
    brand:string;
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

const apiFeatures = async(data:Model<ProductModelTypes>, queryStr:string) => {
    try {
        const product:APIFeaturesTypes[]|undefined = await data.find({
            name:{
                $regex:queryStr,
                $options:"i"
            }
        });

        return product;        
    } catch (error) {
        console.log(error);
        const ee:string = "error from apiFeatures";
        return ee;        
    }
};

export default apiFeatures;
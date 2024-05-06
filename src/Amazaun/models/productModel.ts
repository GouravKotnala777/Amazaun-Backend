import mongoose, { Document, Schema } from "mongoose";



export interface ProductModelTypes extends Document {
    category:string;
    brand:string;
    name:string;
    price:number;
    


    
    allergen:string;
    promotional:{
        discount:number;
        specialOffer:{offerName:string; offerAmount:number;}
    };
    shippingCriteria:{
        weight:number;
        dimension:{
            length:number;
            width:number;
            height:number;
        };
        restriction:string;
    };
    salesHistory:{
        unitSold:number;
        Revenue:number;
    };
    description:string;
    flavor?:string;





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
    category:String,
    brand:String,
    name:String,
    price:Number,


    allergen:String,
    promotional:{
        discount:Number,
        specialOffer:{offerName:String, offerAmount:Number}
    },
    shippingCriteria:{
        weight:Number,
        dimension:{
            length:Number,
            width:Number,
            height:Number
        },
        restriction:{
            type:String,
            enum:[undefined, "temperature specific", "brittle material", "over weight", "over volume"]
        }
    },
    salesHistory:{
        unitSold:{type:Number, default:0, required:true},
        Revenue:Number
    },
    description:String,
    flavor:{
        type:String
    },



    ratings:{
        type:Number,
        default:0
    },
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
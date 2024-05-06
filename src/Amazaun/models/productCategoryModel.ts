import mongoose from "mongoose";

interface ProductCategoryTypes {
    category:string;
    what:string;
    role:string[];
    benefits:string[];
    usage:string[];
    caution:string[];
    photo:string;
};

const productCategorySchema = new mongoose.Schema<ProductCategoryTypes>({
    category:{
        type:String,
        unique:true,
        required:true
    },
    what:{
        type:String,
        required:true
    },
    role:[{
        type:String,
        required:true
    }],
    benefits:[{
        type:String,
        required:true
    }],
    usage:[{
        type:String,
        required:true
    }],
    caution:[{
        type:String,
        required:true
    }],
    photo:{
        type:String,
        required:true
    }
});

const productCategoryModel = mongoose.model<ProductCategoryTypes>("ProductCategory", productCategorySchema);

export default productCategoryModel;
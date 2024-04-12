import mongoose, { Document, Types } from "mongoose";


interface CartItemsSchemaTypes {
    product: string;        
    quantity:number;
    image:string;
};
interface PaymentTypes {
    transactionId:string;
    status:string;
};

interface CartSchemaTypes extends Document {
    _id:Types.ObjectId;
    cartItems:CartItemsSchemaTypes[];
    user:Types.ObjectId;
    paymentInfo:PaymentTypes;
};

const orderSchema = new mongoose.Schema<CartSchemaTypes>({
    cartItems:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        },
        quantity:{
            type:Number
        },
        image:String
    }],
    user:mongoose.Schema.Types.ObjectId,
    paymentInfo:{
        transactionId:String,
        status:{
            type:String,
            default:"Pending"
        }
    }
});

const orderModel = mongoose.model<CartSchemaTypes>("Cart", orderSchema);

export default orderModel;
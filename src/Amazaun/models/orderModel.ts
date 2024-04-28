import mongoose, { Types } from "mongoose";

interface PaymentTypes {
    transactionId:string;
    shippingType:string;
    subTotal:number;
    total:number;
    status?:string;
    message?:string;
};

interface OrderItemsSchemaTypes {
    productGrouped:{
        _id?:string;
        product: string;        
        quantity:number;
    }[];
    paymentInfo:PaymentTypes;
};
interface OrderSchemaTypes extends Document {
    _id:Types.ObjectId;
    orderItems:OrderItemsSchemaTypes[];
    user:Types.ObjectId;
};


const orderSchema = new mongoose.Schema<OrderSchemaTypes>({
    orderItems:[{
        productGrouped:[{
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            quantity:{
                type:Number
            }
        }],
        paymentInfo:{
            transactionId:String,
            shippingType:{
                type:String,
                enum:["instant", "standard", "regular"],
                required:true
            },
            subTotal:{
                type:Number,
                required:true
            },
            total:{
                type:Number,
                required:true
            },
            status:{
                type:String,
                default:"Pending"
            },
            message:{
                type:String
            },
            time:{
                type:Date,
                default:Date.now()
            }
        }
    }],
    user:mongoose.Schema.Types.ObjectId,
});

const orderModel = mongoose.model<OrderSchemaTypes>("Order", orderSchema);

export default orderModel;
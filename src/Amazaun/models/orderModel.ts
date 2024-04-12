import mongoose, { Types } from "mongoose";

interface PaymentTypes {
    transactionId:string;
    status?:string;
    message?:string;
};

interface OrderItemsSchemaTypes {
    product: string;        
    quantity:number;
    paymentInfo:PaymentTypes;
};
interface OrderSchemaTypes extends Document {
    _id:Types.ObjectId;
    orderItems:OrderItemsSchemaTypes[];
    user:Types.ObjectId;
};


const orderSchema = new mongoose.Schema<OrderSchemaTypes>({
    orderItems:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        },
        quantity:{
            type:Number
        },
        paymentInfo:{
            transactionId:String,
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
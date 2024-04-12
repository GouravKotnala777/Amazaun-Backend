import mongoose from "mongoose";

const connectDatabase = (uri:string) => {
    mongoose.connect(uri, {
        dbName:"Amazaun"
    })
    .then(() => console.log("database...."))
    .catch((error) => console.log(error));
}

export default connectDatabase;
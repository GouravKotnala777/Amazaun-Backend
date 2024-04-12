import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";



cloudinary.config({
    cloud_name: 'dx4comsu3',
    api_key: '743697635372899',
    api_secret: 'ELXRqD6ZYrIcgl0Q9rMMGGhtbHU',
});
    
export const uploadOnCloudinary = async(localFilePath:string, cloudinaryDestinationFolder:string) => {    
    try {
        if (!localFilePath) {
            console.log(localFilePath, "localFilePath nahi hai");
            return null;
        }

        const res = await cloudinary.uploader.upload(localFilePath, {
            folder:cloudinaryDestinationFolder
        });

        if (res.url) {
            console.log(localFilePath, "from try");
            console.log("File is uploaded succesfully", res.url);
            fs.unlinkSync(localFilePath);
        }

        return res;
    } catch (error) {
        console.log(error);
        console.log(localFilePath, "from catch");
        fs.unlinkSync(localFilePath);
        return null;
    }
};


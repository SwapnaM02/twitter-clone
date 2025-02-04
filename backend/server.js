import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary"

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js"

import connectMongoDB from "./db/connectMongoDB.js";

const app=express();

dotenv.config();

// with this we are connected to cloudinary account, we can upload or delete images
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});
const PORT=process.env.PORT || 5000;

console.log(process.env.MONGO_URI);

app.use(express.json())  // to parse req.body, app.use is a middlewear
app.use(express.urlencoded({extended:true})) // to use the postman urlencoded
app.use(cookieParser()) // we need this to parse the request.cookie
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);

app.get("/",(req,res)=>{
    res.send("server is ready");
})
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
    connectMongoDB();
    
})
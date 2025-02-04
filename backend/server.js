import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser";
const app=express();

dotenv.config();
const PORT=process.env.PORT || 5000;

console.log(process.env.MONGO_URI);

app.use(express.json())  // to parse req.body, app.use is a middlewear
app.use(express.urlencoded({extended:true})) // to use the postman urlencoded
app.use(cookieParser()) // we need this to parse the request.cookie
app.use("/api/auth",authRoutes);

app.get("/",(req,res)=>{
    res.send("server is ready");
})
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
    connectMongoDB();
    
})
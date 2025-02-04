import express from "express";
import { protectRoute } from "../middleware/protectedRoute.js";
const router=express.Router();
import {getMe, signup,login,logout } from "../controllers/auth.controller.js";
router.get("/me",protectRoute,getMe)
router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);

export default router;


import express from "express";
import { protectRoute } from "../middleware/protectedRoute.js";
import { createPost,deletePost,commentOnPost,likeUnlikePost,getAllPosts,getLikedPosts,getFollowingPosts,getUserPosts } from "../controllers/post.controller.js";
const router=express.Router();


router.get("/all",protectRoute,getAllPosts);
// posts of the users that we follow
router.get("/following",protectRoute,getFollowingPosts);
router.get("/likes/:id",protectRoute,getLikedPosts);
// only users who are authenticated can create a posts
router.post("/create",protectRoute,createPost);
router.delete("/like/:id",protectRoute,deletePost);
router.get("/user/:username",protectRoute,getUserPosts);

// // the id of the post that we like
router.post("/like/:id",protectRoute,likeUnlikePost);
router.post("/comment/:id",protectRoute,commentOnPost);
export default router;
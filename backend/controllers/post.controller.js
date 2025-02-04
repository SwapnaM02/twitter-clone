import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}


        // we will check if we are owner of the post
		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];

            // we have deleted that img from cloudinary
			await cloudinary.uploader.destroy(imgId);
		}

        // now we need to delete this document from mongoDB
		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

        // first we need to check if user liked this post
		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post - we have updated the post,the number of likes it has.
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } }); // from the likes array we would like to remove the user ID

            // when the user likes the post, we need to update the user model. for updateOne()- we pass the current user and we are going to remove the postId from the liked post array of this user.
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()  // it will given all the posts
			.sort({ createdAt: -1 }) // it gives the latest post at the top
			.populate({
				path: "user",
				select: "-password",
			})

            // in the post, we have a field as comment.inside the comment there ia again a field "user", in that "user" filed we need to poplate the user. so the path:"comments.user".refer the post.model for better understanding
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};


export const getLikedPosts = async (req, res) => {
    // 1. Extract the user ID from the request parameters
	const userId = req.params.id;
    console.log("Fetching liked posts for user ID:", userId);

	try {
        //  2. Find the user by their ID
		const user = await User.findById(userId);
        console.log("User found:", user);
		if (!user) return res.status(404).json({ error: "User not found" });


        // we need to find all the posts that this current user has liked
        // 4. Find all posts that the user has liked
        /** This code is responsible for finding all the posts that a user has liked, and then populating additional details about the users who created those posts and the users who commented on them.
         Post.find({ _id: { $in: user.likedPosts } }):
         Post: Refers to the Post model (or collection) in your database.
         .find({ ... }): This is a MongoDB query method that retrieves documents from the Post collection that match the specified criteria.
         _id: { $in: user.likedPosts }:
         _id: Refers to the unique identifier of a post.
         $in: This is a MongoDB operator that checks if the _id of a post exists in the user.likedPosts array.
         user.likedPosts: This is an array of post IDs that the user has liked. It is stored in the likedPosts field of the user document.
         */
		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }) // if the user liked post array include postid
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
        // currently authenticated user
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		// will get the following array of the current user
        const following = user.following;

        // the following array is included in the user field in the post
		const feedPosts = await Post.find({ user: { $in: following } })
        // we would like to sort this to get the latest field on the top.
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};


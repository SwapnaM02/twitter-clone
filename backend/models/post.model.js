import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
        // each post will have a user
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

        // each post will have text or image 
		text: {
			type: String,
		},
		img: {
			type: String,
		},

        // post will have some likes,it is going to be array of references to the user model
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],

        // each post will have some comments.it is going to be array.each comment will have text.for comment the text is required field. we are going to pass user so that we know who posted that comment
		comments: [
			{
				text: {
					type: String,
					required: true,
				},
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
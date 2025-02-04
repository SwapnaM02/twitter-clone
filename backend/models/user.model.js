import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		fullName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		}, 

        // the following field are optional where they can set once they signup
		followers: [

            // each user will have some followers which is type of array.each follower we are going to keep as userid.
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
                // user will have zero follower initially when they signup.
			},
		],
        following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
        profileImg: {
			type: String,
			default: "",
		},
		coverImg: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},

		link: {
			type: String,
			default: "",
		},

		// we are maintaining the likedPosts, caz when we visit a userprofile, we should able to see the posts that they liked it.each post or each document will be a refernce to the post
		likedPosts:[{
			type:mongoose.Schema.Types.ObjectId,
			ref:"Post",
			default:[]  // intially when they sigup, they didn't like any posts. we want to update this array when a user like or unlike posts.
		}]
    },{timestamps:true});

    const User= mongoose.model("User",userSchema);

    export default User;
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
    },{timestamps:true});

    const User= mongoose.model("User",userSchema);

    export default User;
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary"
// models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnfollowUser = async (req, res) => {
	try {

        // we will get the id that we are passing as params so that we know which user to follow or unfollow.
		const { id } = req.params;
        
        // two different users that would like to modify ,the user that would like to follow or unfollow.
        // their profile with "id"
		const userToModify = await User.findById(id);


        // current user
		const currentUser = await User.findById(req.user._id);


        // user can't follow himself. We use "toString()" caz when we set the user._id in the request,this will be in the type of object. if we convert to string which is the same type with the "useparams"
		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

        // if we are following the user or not
		const isFollowing = currentUser.following.includes(id);
 
        // if we are following , we are going to unfollow and in else case it is vice versa
		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            
            //  if we unfollow means we don't need to send the notification

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });


			// Send notification to the user
            // once we follow a user, we like to send notification to tht user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});
            console.log("Notification",newNotification);

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};
/**
 * john=1                                                   jane=2
 * case 1=john wants to follow jane, so
 * 
 * john following:[2 (jane)]                                       jane followers:[1(john)]
 * 
 * case 2= when jane wants to follow john
 * john follower=[2 (jane)]                                        jane following:[1 (john)]
 * 
 * case 3= jane regrets, he wants to unfollow john
 * john follower[2 is removed]                       jane following:[1 is removed], as he   unfollwed
 */









/** first in the try ,before writing the function we need to exclude currentuser from the suggested usera array caz we don't really want to suggest ourselves in the sidebar and exclude the users we already follow*/
export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;


        // Fetch the list of users the current user is already following.
		const usersFollowedByMe = await User.findById(userId).select("following");

          /**
           usersfollowedbyme = {
          _id: new ObjectId('67a1a44e13dfdc06284ab6cb'),
        following: [
        new ObjectId('67a1aa8b5a0053ad7ef1d154'),
        new ObjectId('67a1af54f825c58605f05580')
  ]
}
           */
        console.log("usersfollowedbyme:",usersFollowedByMe);


       /** Fetch a random sample of users from the database, excluding the current user.User.aggregate([...])= This performs an aggregation operation on the User collection in the database. 
        $match: { _id: { $ne: userId } }: This filters out the current user ($ne means "not equal") so that the current user is not included in the suggested users.
        $sample: { size: 10 }: This randomly selects 10 users from the filtered list.
       */
		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);




        /**aggregated users=aggregated users [
  {
    _id: new ObjectId('67a1a5b586c3bb261e980567'),
    username: 'janedoe',
    fullName: 'Jane Doe',
    password: '$2a$10$1EoY.laKi7/5qhzF3/1jm.Vnrvm8xkuAq06xLVLn.rj9pZtmCaPB.',
    email: 'jane@gmail.com',
    followers: [],
    following: [],
    profileImg: '',
    coverImg: '',
    bio: '',
    link: '',
    createdAt: 2025-02-04T05:29:25.258Z,
    updatedAt: 2025-02-04T10:16:39.652Z,
    __v: 0
  },
  {
    _id: new ObjectId('67a1aa8b5a0053ad7ef1d154'),
    username: 'swapna',
    fullName: 'swapna reddy',
    password: '$2a$10$m2YDf9qDOiYXTOuZvRxP..rirl7ONR1IohbIiR.xRHm2Kjn3LYF1y',
    email: 'swapna@gmail.com',
    followers: [ new ObjectId('67a1a44e13dfdc06284ab6cb') ],
    following: [],
    profileImg: '',
    coverImg: '',
    bio: '',
    link: '',
    createdAt: 2025-02-04T05:50:03.899Z,
    updatedAt: 2025-02-04T10:41:16.001Z,
    __v: 0
  },
  {
    _id: new ObjectId('67a1af54f825c58605f05580'),
    username: 'john',
    fullName: 'John',
    password: '$2a$10$CRucposzrnnlXAtWLo4kt.0z5KBOrxvoyNzB7l8pCbJXBPldOq4hK',
    email: 'john@gmail.com',
    followers: [ new ObjectId('67a1a44e13dfdc06284ab6cb') ],
    following: [],
    profileImg: '',
    coverImg: '',
    bio: '',
    link: '',
    createdAt: 2025-02-04T06:10:28.973Z,
    updatedAt: 2025-02-04T10:42:33.005Z,
    __v: 0
  }
] */
        console.log("aggregated users",users)

		// 1,2,3,4,5,6,
        /** users.filter(...): This filters the randomly selected users to exclude those that the current user is already following.
         usersFollowedByMe.following.includes(user._id): This checks if the current user's following array does not include the _id of the user in the list. If the user is not already being followed, they are included in the filteredUsers array.
         */
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));


        /** filteredUsers.slice(0, 4): This limits the list of suggested users to the first 4 users in the filteredUsers array. */
		const suggestedUsers = filteredUsers.slice(0, 4);


        /**suggestedUsers.forEach(...): This iterates over the suggestedUsers array and sets the password field to null for each user. This ensures that sensitive information (like passwords) is not sent to the client. */
		suggestedUsers.forEach((user) => (user.password = null));


        /** 
         suggestedUsers= [
  {
    _id: new ObjectId('67a1a5b586c3bb261e980567'),
    username: 'janedoe',
    fullName: 'Jane Doe',
    password: null,
    email: 'jane@gmail.com',
    followers: [],
    following: [],
    profileImg: '',
    coverImg: '',
    bio: '',
    link: '',
    createdAt: 2025-02-04T05:29:25.258Z,
    updatedAt: 2025-02-04T10:16:39.652Z,
    __v: 0
  }
]*/
        console.log("suggestedUsers",suggestedUsers);

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};





export const updateUser = async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;

    // profileImg,coverImg are let caz we are going to reassign these values later in the function
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {

            // we will check if the current password is matching
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}


        // if user wants to update their profile image.To be able to update an image or store an image we will be using cloudinary.b4 we write any code we need to create an account.once you create an account in cloudinary > go inside programmable media.next step go inside the .env file to setup the api key,password.
		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png

                // we use the below ".split("/").pop().split(".")[0] = to get the id(zmxorcxexpdbh8r0bkjb)
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullName = fullName || user.fullName;  // if fullName is not updated, we will keep whats there in the database
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response, null is not updated in the database.
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};
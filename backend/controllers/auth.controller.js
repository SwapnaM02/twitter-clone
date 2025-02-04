import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";


export const signup=async(req,res)=>{
    try{
        const {fullName,username,email,password}=req.body;
        

        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex){
            return res.status(400).json({error:"Invalid email format"});
        }

        const existingUser = await User.findOne({username:username});
        if(existingUser){
            return res.status(400).json({error:"Username is already taken"});
        }

        const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

        if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

        // hashpassword
        const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			fullName:fullName,
			username:username,
			email:email,
			password: hashedPassword,
		});
        console.log(newUser)
        
/**{
  username: 'swa',fullName: 'Swapna',password: '$2a$10$XAJebJGkHHmftbpaW7Dsqet2EmflVMPM0TVIFkMkay3KjWBswKiP2',email: 'm.v.swapna@gmail.com',
followers: [],following: [], profileImg: '',coverImg: '',bio: '',link: '',id: new ObjectId('67a0ac7774b09f3dfa2afa53')
} */
        
        // once we have the user,we would like to generate a token and set the cookie.this token is JWT token
        if(newUser){
            /** In the line generateTokenAndSetCookie(newUser._id, res);, the res parameter refers to the response object in Express.js. This object is used to send a response back to the client (e.g., a browser or a frontend application) after processing a request.
             1.res.cookie(name, value, [options]): Used to set a cookie in the client's browser. This is likely used in the generateTokenAndSetCookie function to set a cookie containing the JWT token.
             2.res.status(code): Sets the HTTP status code for the response (e.g., 200 for success, 400 for bad request, etc.).
             3.res.json(body): Sends a JSON response to the client.
             4.res.send(body): Sends a response of various types (e.g., string, object, buffer).
             5.res.headers: Contains the headers that will be sent in the response.
             
             the generateTokenAndSetCookie function likely uses the res object to:Set a cookie: It might use res.cookie() to set a cookie in the client's browser containing the JWT token.Attach the token to the response: It might also attach the token to the response headers or body if needed.
            */
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});

        }else{
            res.status(400).json({ error: "Invalid user data" })

        }

    }
    catch(error){
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });

    }
}
export const login=async(req,res)=>{
    try {
		const { username, password } = req.body;
		const user = await User.findOne({ username:username });

        // if user doesn't exist(empty) compare with empty string.(" ") which will return false ; we cant compare string with undefined. so that application does not crash.
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}
export const logout=async(req,res)=>{
    try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

// this is going to give authenticated user
export const getMe = async (req, res) => {
	try {
        // 
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
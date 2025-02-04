import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie=(userId,res)=>{
    /** we are getting the response caz we are going to set the cookie and send it back to client. 
     * jwt.sign(payload, secretOrPrivateKey, [options, callback])
     *payload = the data you want to include in the token. This is typically an object containing user-specific information, such as userId, username, or roles.
     * { userId: "12345", role: "admin" }
     * secretOrPrivateKey (String | Buffer):A secret key or private key used to sign the token. This ensures the token's integrity and authenticity.Example:process.env.JWT_SECRET
    */

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        
		expiresIn: "15d",
	});
    console.log("token",token);
    console.log("userid",userId);

    res.cookie("jwt", token, {
        // couple of different options to make it secure.
		maxAge: 15 * 24 * 60 * 60 * 1000, //MS (15days in milliseconds)
		httpOnly: true, // prevent XSS attacks (cross-site scripting attacks). that means token can't be accessible via javascript.it will be accessible by http only.
		sameSite: "strict", // CSRF attacks cross-site request forgery attacks.
		secure: process.env.NODE_ENV !== "development", /** it should only be true in production so that it could have that https */
	});



};
import {User}  from "../models/User.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body

    try {
        if (!fullName || !password || !email) {
            return res.status(400).json({ message: "All field are required" })
        }
        if (password < 6) {
            return res.status(400).json({ message: "password must be atleast 6 character" })
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "invalid email" })
        }
        const user = await User.findOne({email});
        if (user){
            return res.status(400).json({message:"Email already exist"})
        }
        //change password eg -- 123456 -> in unreadable form
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password , salt)

        const newUser = new User ({
            fullName,
            email,
            password:hashedPassword
        })
        if(newUser){
            generateToken(newUser._id , res)
            await newUser.save()
            res.status(201).json({
                _id:newUser._id ,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });
        }else{
            res.status(400).json({message:"invalid user data"})
        }

    } catch (error) {
        console.log("error in signup controller:", error);
        res.status(500).json({message:"internal server error"});

    }
};

export const login = async (req, res) => {
const {email , password} = req.body

try {
   const user = await User.findOne({email});
   if (!user) return res.status(400).json({message:"invalid credentials"})

    const isPasswordCorrect = await bcrypt.compare(password,user.password)
    if(!isPasswordCorrect) return res.status(400).json({message:"invalid credentials"})

        generateToken(user._id,res)

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email: user.email,
            profilePic:user.profilePic
        });
         
} catch (error) {
    console.error("Error in login controller:" , error );
    res.status(500).json({message:"internal server error"});
}
}

export const logout = (_, res) => {
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"logout successfully"});
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        if (!profilePic) return res.status(400).json({message:"profile pic is required"});

        const userId = req.user._id; // comes from a middleware auth.middleware before the next function line

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {profilePic : uploadResponse.secure_url},
            {new:true}
        );
        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error in update profilepic:",error);
        res.status(500).json({message:"internal server error"});
    }
};
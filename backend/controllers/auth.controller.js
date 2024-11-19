import nodemailer from 'nodemailer';
import crypto from 'crypto';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
import dotenv from 'dotenv';
dotenv.config();

const generateOTP = () => crypto.randomInt(100000, 999999).toString();
console.log('email '+process.env.EMAIL);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username is Already Taken" });
        }
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email is Already in Use" });
        }
        if (password.length < 6) {
            return res.status(401).json({ error: `Password length less than 6 characters` });
        }

        const otp = generateOTP();
        const otpExpiry = Date.now() + 15 * 60 * 1000;
        console.log(otp, email);
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Your OTP for Signup',
            text: `Your OTP is ${otp}. It is valid for 15 minutes.`,
        });

        const hashedPassword = await bcrypt.hash(password, 10);
        const tempUser = {
            fullName,
            username,
            email,
            password: hashedPassword,
            otp,
            otpExpiry,
        };

        req.session.tempUser = tempUser;
        console.log(tempUser);
        return res.status(200).json({ message: "OTP sent to email. Please verify." });
    } catch (err) {
        console.log("Error in signup Controller", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const tempUser = req.session.tempUser;

        if (!tempUser) {
            return res.status(400).json({ error: "Session expired or invalid request" });
        }

        if (tempUser.otp !== otp || Date.now() > tempUser.otpExpiry) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const newUser = new User({
            fullName: tempUser.fullName,
            username: tempUser.username,
            email: tempUser.email,
            password: tempUser.password,
        });

        await newUser.save();
        generateTokenAndSetCookie(newUser._id, res);

        req.session.tempUser = null;

        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            followers: newUser.followers,
            following: newUser.following,
            profileImg: newUser.profileImg,
            coverImg: newUser.coverImg
        });
    } catch (err) {
        console.log("Error in verifyOTP Controller", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordValid = await bcrypt.compare(password, user?.password || "");
        if (!user || !isPasswordValid) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        generateTokenAndSetCookie(user._id, res);

        return res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        });

    } catch (err) {
        console.log("Error in Login Controller");
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logout Successful" });
    } catch (err) {
        console.log("Error in Logout Controller");
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (err) {
        console.log("Error in getMe Controller:" + err.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// export const signup = async (req, res)=>{
//     try{
//         const {username,fullName,email,password} = req.body;
//         //check email format
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 		if (!emailRegex.test(email)) {
// 			return res.status(400).json({ error: "Invalid email format" });
// 		}
//         //check username exist
//         const existingUser = await User.findOne({username});
//         if(existingUser){
//             return res.status(400).json({ error: "Username is Already Taken" });
//         }
//         //check email exist
//         const existingEmail = await User.findOne({email});
//         if(existingEmail){
//             return res.status(400).json({ error: "email is Already in Use" });
//         }
//         //check password length;
//         if(password.length < 6){
//             return res.status(401).json({error:`password length less than 6 character`});
//         }
//         //hash password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password,salt);
        
//         const newUser = new User({
//             fullName,
//             username,
//             email,
//             password:hashedPassword,
//         })
//         if(newUser){
//             generateTokenAndSetCookie(newUser._id,res);
//             await newUser.save();

//            return res.status(201).json({_id: newUser._id,
//                 fullName: newUser.fullName,
//                 userName: newUser.username,
//                 email: newUser.email,
//                 followers: newUser.followers,
//                 following: newUser.following,
//                 profileImg: newUser.profileImg,
//                 coverImg: newUser.coverImg
//             });
//         }else{
//             return res.send(400).json({message :"User Cannot be Created"});
//         }
//     }catch(err){
//         console.log("Error in signup Controller");
//         return res.status(500).json({error:"Internal Server Error"});
//     }
//  }
//  export const login = async (req, res)=>{
//     try{
//         const {username,password} = req.body;
//         const user = await User.findOne({username});
//             const isPasswordValid = await bcrypt.compare(password,user?.password||"");
//             if(!user || !isPasswordValid){
//                 return res.status(400).json({error: 'Invalid username or password'});
//             }
//             generateTokenAndSetCookie(user._id,res);

//            return res.status(201).json({_id: user._id,
//                 fullName: user.fullName,
//                 userName: user.username,
//                 email: user.email,
//                 followers: user.followers,
//                 following: user.following,
//                 profileImg: user.profileImg,
//                 coverImg: user.coverImg
//             });
        
//     }catch(err){
//         console.log("Error in Login Controller");
//         return res.status(500).json({error:"Internal Server Error"});
//     }
//  }
//  export const logout = async (req, res)=>{
//     try{
//         res.cookie("jwt","",{maxAge:0});
//         res.status(200).json({message:"Logout Successfull"});
//     }catch(err){
//         console.log("Error in Logout Controller");
//         return res.status(500).json({error:"Internal Server Error"});
//     }
//  }

//  export const getMe = async (req,res)=>{
//     try{
//         const user = await User.findById(req.user._id).select("-password");
//         res.status(200).json(user);
//     }catch(err){
//         console.log("Error in getMe Controller:"+err.message);
//         return res.status(500).json({error:"Internal Server Error"});
//     }
//  }
import {v2 as cloudinary} from 'cloudinary';
import mongoose from 'mongoose';
import User from "../models/user.model.js";
import Post from '../models/post.model.js';
import Notification from '../models/notification.model.js';

export const createPost = async (req,res) =>{
try{
    const {text} = req.body;
    let {img} = req.body;
    const userId = req.user._id;
    const user = await User.findOne(userId);
 
    if(!user) return res.status(404).json({error:"User not found"});

    if(!text && !img) return res.status(400).json({error:"Post Must Have Text or Img"});

    if(img) {
        const uploadedResponse = await cloudinary.uploader.upload(img);
        img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
        user:userId,
        text,
        img
    });
    await newPost.save();
    res.status(200).json(newPost);
}
catch(err){
    console.log('error in createPost controller : '+ err.message);
    return res.status(500).json({error:err.message});
}
}
export const deletePost = async (req,res) =>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({error:"No such post found"});
        if(post.user.toString()!== req.user._id.toString()){
            return res.status(401).json({error:"you are not authorized to delete this post"});
        }
        if(post.img){
            const imgId = post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'Post deleted successfully'});
    }catch(err){
        console.log('error in deletePost controller : '+ err.message);
        return res.status(500).json({error:err.message});
    }
}

export const commentOnPost = async (req,res)=>{
    try{
        const {text} = req.body;
        const postId = req.params.id;
       const userId = req.user._id;
        if(!text){
            return res.status(400).json({error: "text field is required"});
        }
        const post = await Post.findById(postId);
        console.log(post);
        if(!post){
            return res.status(404).json({error: "Post Not Found"});
        }
        const comment = {user:userId,text};
        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);
    }catch(err){
        console.log('error in commentOnPost controller : '+ err.message);
        return res.status(500).json({error:err.message});
    }
}

export const likeUnlikePost = async (req,res)=>{
    try{
        const userId = req.user._id;
        const {id:postId} = req.params;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error:"post not found"});
        }

        const userLikedPost = post.likes.includes(userId);
         if (userLikedPost){
            //unlike post
            await Post.updateOne({_id:postId},{$pull: {likes: userId}});
            await User.updateOne({_id:userId},{$pull: {likedPosts: postId}});
            
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
         } else{
            //like post
            post.likes.push(userId);
            await post.save();
            const notification = new Notification({
                from :userId,
                to:post.user,
                type:"like"
            });
            await notification.save();
            await User.updateOne({_id:userId},{$push: {likedPosts: postId}});
            const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
         }
    }catch(err){
        console.log('error in likeUnlikePost controller : '+ err.message);
        return res.status(500).json({error:err.message});
    }
}

export const getAllPosts = async (req,res) =>{
    try{
        const posts = await Post.find().sort({ createdAt: -1}).populate({
            path: "user",
            select : "-password"
        })
        .populate({
            path:"comments.user",
            select : "-password"
        });
        if(posts.length === 0){
            return res.status(200).json([]);
        }
        return res.status(200).json(posts);

    }catch(err){
        console.log('error in getAllPosts controller : '+ err.message);
        return res.status(500).json({error:err.message});
    }
}

export const getLikedPosts = async(req,res)=>{
    const userId = req.params.id;
    try{
        const user = await User.findById(userId);
        if(!user) res.status(404).json({error: 'User not found'});

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path:"user",
            select: "-password",
        })
        .populate({
            path:"comments.user",
            select : "-password"
        });
        res.status(200).json(likedPosts);
    }catch(err){
        console.log('error in getLikedPosts controller : '+ err.message);
        return res.status(500).json({error:err.message});
    }
}

export const getFollowingPosts = async (req,res)=>{
    try{
        const userId = req.user._id;
        if (!userId) {
            console.log("Invalid user ID");
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await User.findById(userId);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ error: 'User not found' });
        }

        const following = user.following;

        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password"
            });

         res.status(200).json(feedPosts);
    }
    catch(err){
        console.log('error in getFollowingPosts controller : '+ err.message);
        return res.status(500).json({error:err.message});
    }
}

export const getUserPosts = async (req,res) => {
    try{
        const {username}  = req.params;
        const user = await User.findOne({username});
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ error: 'User not found' });
        }
        const posts = await Post.find({user: user._id}).sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password"
        });
        res.status(200).json(posts);
    }catch(err){
        console.log('error in getUserPosts controller : '+ err.message);
        return res.status(500).json({error:err.message});
    }
}
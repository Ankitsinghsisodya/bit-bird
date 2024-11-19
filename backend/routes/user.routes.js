import express from 'express';
import {protectRoute} from '../middleware/protectRoute.js';
import {getUserProfile,followUnfollowUser,getSuggestedUsers,updateUser,followingList,getfriendProfile} from '../controllers/user.controller.js'
const router = express.Router();

router.get('/fprofile/:friendId', getfriendProfile);
router.get("/profile/:username",protectRoute,getUserProfile);
router.get('/suggested',protectRoute,getSuggestedUsers);;
router.post('/follow/:id',protectRoute,followUnfollowUser);
router.post('/update',protectRoute,updateUser);
router.get('/:userId/following',protectRoute,followingList);
  


export default router;
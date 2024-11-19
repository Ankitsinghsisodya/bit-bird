import express from 'express';
import { getChats,doChats } from '../controllers/chat.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/:userId/:friendId',protectRoute,getChats);
router.post('/',protectRoute,doChats);
  
export default router;
import Chat from '../models/chat.model.js';
import io from '../server.js';  

export const getChats =  async (req, res) => {
    try {
      const chats = await Chat.find({
        $or: [
          { sender: req.params.userId, receiver: req.params.friendId },
          { sender: req.params.friendId, receiver: req.params.userId }
        ]
      }).sort('timestamp');
      res.status(200).json(chats);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

export const doChats = async (req, res) => {
    const chat = new Chat({
      sender: req.body.sender,
      receiver: req.body.receiver,
      message: req.body.message
    });
  
    try {
      const newChat = await chat.save();
      const roomId = [req.body.sender, req.body.receiver].sort().join('_');
      io.to(roomId).emit('receiveMessage', newChat);
      res.status(201).json(newChat);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
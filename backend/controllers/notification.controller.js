import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';


export const getNotifications = async (req,res) =>{
try{
const userId = req.user._id;
const user = await User.findById(userId);
    if (!user) {
        console.log("User not found");
        return res.status(404).json({ error: 'User not found' });
    }
    const notification = await Notification.find({to:userId})
    .populate({
        path : "from",
        select : "username profileImg"
    });
    await Notification.updateMany({to:userId}, {read: true});
    return res.status(200).json(notification); 
}catch(err){
    console.log('error in getNotifications controller : '+ err.message);
        return res.status(500).json({error:err.message});
}
}

export const deleteNotifications = async (req,res) =>{
 try{
    const userId = req.user._id;
    const user = await User.findById(userId);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ error: 'User not found' });
        }
        await Notification.deleteMany({to:userId});
        return res.status(200).json({message: 'User deleted successfully'});

}catch(err){
    console.log('error in deleteNotifications controller : '+ err.message);
    return res.status(500).json({error:err.message});
}   
}

export const deleteOneNotification = async (req,res) =>{
    try{
    const userId = req.user._id;
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({error:'Not Found User'});
    const notificationId = req.params.id;
    const notification = Notification.findById(notificationId);
    if(!notification) return res.status(404).json({error: 'Not Found Notification'});
    await Notification.findByIdAndDelete(notificationId);
    res.send(200).json({message: 'Successfully deleted Notification'});
    }catch(err){
        console.log('error in deleteOneNotification controller : '+ err.message);
        return res.status(500).json({error:err.message});
    }
    
}
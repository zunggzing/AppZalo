const messageService = require('../services/messageService');

class MessageController{
    async addNewTextAndEmoji(req, res){
        try {
            let senderId = req.user.data.user._id; // id cua user dang nhap
            let receiverId = req.body.uid; // id cua user muon ket ban
            let messageVal = req.body.messageVal; //tin nhắn từ client gửi 
            let isChatGroup = req.body.isChatGroup; // ktra phải nhóm hay ko?
            let newMessage = await messageService.addNewTextAndEmoji(senderId, receiverId, messageVal, isChatGroup);
            return res.status(200).send({ success: !!newMessage });
        } catch (error) {
            return res.status(500).send(error);
        }
    }
}
module.exports = new MessageController;
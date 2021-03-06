const contactService = require('../services/contactService');
const chatGroupService = require('../services/chatGroupService');
const sortJsonArray = require('sort-json-array');
const axios = require('axios');
const http = require('../controllers/http');
const messageUtil = require('../utils/message');
const FilesUtil = require('../utils/uploadAndDeleteFiles');
const moment = require('moment');
const {
  v4: uuidv4
} = require('uuid');
const message = require('../utils/message');

class MessageService {
  getListItemContacts(senderId) {
    return new Promise(async (resolve, reject) => {
      try {
        // lấy danh sách bạn bè
        let userIsFriend = await contactService.getContacts(senderId);
        //lấy tất cả tin nhắn
        let messages = await axios.get(http + '/messages/SearchBySenderIdOrReceiverId/' + senderId);
        //tìm các user đã từng nhắn tin
        let listUser = messages.data.map(async message => {
          if (message.receiverId !== senderId) {
            let user = await axios.get(http + '/users/' + message.receiverId);
            return user.data.user;
          } else {
            let user = await axios.get(http + '/users/' + message.senderId);
            return user.data.user;
          }
        });

        //gom 2 mảng
        let listAllUser = userIsFriend.getContacts.concat(await Promise.all(listUser));

        // loại những user trùng theo id
        let set = new Set(listAllUser.map(user => {
          return user._id;
        }));
        let listId = Array.from(set);

        //tìm user theo id
        let users = listId.map(async (id) => {
          let user = await axios.get(http + '/users/' + id);
          return user.data.user;
        });

        //lọc ra những phần tử null(group)
        var userConversation = (await Promise.all(users)).filter(function (e) {
          return e != null
        });

        //lấy ds groups
        let groupConversation = await chatGroupService.getChatGroups(senderId);
        //gom 2 mảng
        let allConversation = userConversation.concat(groupConversation);
        allConversation = sortJsonArray(allConversation, 'updatedAt', 'des');
        let allConversationMessages = allConversation.map(
          async (conversation) => {
            // tìm kiếm messages theo senderId và (receiverId hoặc groupId)
            if (conversation.members) {
              let getMessages = await axios.get(
                http + '/messages/SearchByReceiverId/' + conversation._id + "?startFrom=0"
              );
              conversation.messages = getMessages.data;

              let unRead = [];
              getMessages.data.forEach(message => {
                if (message.isRead == false) {
                  unRead.push(message);
                  conversation.countUnRead = unRead.length;
                }
              })
              // Get item last          
              let lastGroup = Object.keys(conversation.messages).pop();
              if (lastGroup) {
                let lastMessGroup = conversation.messages[lastGroup];
                moment.locale('vi');
                let formatedTimeAgo = moment(lastMessGroup.createdAt).fromNow();
                // Set
                conversation.time = formatedTimeAgo;
                conversation.lastText = lastMessGroup.text;
                conversation.messageType = lastMessGroup.messageType;
                conversation.lastIsRead = lastMessGroup.isRead;
                conversation.lastMessage = lastMessGroup;
              }
            } else {
              let getMessages = await axios.get(http + '/messages/SearchBySenderIdAndReceiverId/' + senderId + '/' + conversation._id + '?startFrom=0');
              conversation.messages = getMessages.data;
              let unRead = [];
              getMessages.data.forEach(message => {
                if (message.isRead == false) {
                  unRead.push(message);
                  conversation.countUnRead = unRead.length;
                }
              })
              let lastUser = Object.keys(conversation.messages).pop();
              if (lastUser) {
                let lastItemUser = conversation.messages[lastUser];
                moment.locale('vi');
                let formatedTimeAgoUser = moment(lastItemUser.createdAt).fromNow();
                conversation.time = formatedTimeAgoUser;
                conversation.textUser = lastItemUser.text;
                conversation.messageType = lastItemUser.messageType;
                conversation.lastIsRead = lastItemUser.isRead;
                conversation.lastMessage = lastItemUser;
              }
            }
            return conversation;
          }
        );
        resolve({
          allConversation: allConversation,
          userConversation: userConversation,
          groupConversation: groupConversation,
          allConversationMessages: await Promise.all(allConversationMessages),
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  addInfoMessage(senderId, receiverId, messageVal, messageType) {
    return new Promise(async (resolve, reject) => {
      try {
        let newMessageItem = {
          text: messageVal,
          senderId: senderId,
          receiverId: receiverId,
          chatType: messageUtil.MESSAGE_CHAT_TYPES.GROUP,
          messageType: messageType,
          createdAt: Date.now(),
        };
        //tạo tin nhắn mới
        let newMessage = await axios.post(http + '/messages', newMessageItem);
        //cập nhật thời gian và số lượng tin nhắn
        this.updateTimeForGroup(receiverId);
        return resolve(newMessage.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  addNewText(senderId, receiverId, messageVal, isChatGroup) {
    return new Promise(async (resolve, reject) => {
      try {
        if (isChatGroup === 'true' && messageVal.length > 0) {
          let newMessageItem = {
            text: messageVal,
            senderId: senderId,
            receiverId: receiverId,
            isRead: false,
            chatType: messageUtil.MESSAGE_CHAT_TYPES.GROUP,
            messageType: messageUtil.MESSAGE_TYPES.TEXT,
            createdAt: Date.now(),
          };
          //tạo tin nhắn mới
          let newMessage = await axios.post(http + '/messages', newMessageItem);
          //cập nhật thời gian và số lượng tin nhắn
          this.updateTimeForGroup(receiverId);
          return resolve(newMessage.data);
        }
        if (isChatGroup === 'false' && messageVal.length > 0) {
          let newMessageItem = {
            text: messageVal,
            senderId: senderId,
            receiverId: receiverId,
            isRead: false,
            chatType: messageUtil.MESSAGE_CHAT_TYPES.PERSONAL,
            messageType: messageUtil.MESSAGE_TYPES.TEXT,
            createdAt: Date.now(),
          };
          let newMessage = await axios.post(http + '/messages', newMessageItem);
          // cập nhật thời gian
          this.updateTimeForUser(senderId, receiverId);
          return resolve(newMessage.data);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  uploadFiles(files, senderId, receiverId, isChatGroup) {
    return new Promise(async (resolve, reject) => {
      try {
        let uuid = uuidv4();
        //luu nhiều file vào message
        if (files.length > 1) {
          //nếu là nhóm
          if (isChatGroup === 'true') {
            let getNewMessages = files.map(async (file) => {
              //kiểm tra image hay file
              let mimeType = file.mimetype.split('/')[0];
              //nếu là image
              if (mimeType === 'image') {
                let newMessageItem = {
                  senderId: senderId,
                  receiverId: receiverId,
                  isRead: false,
                  chatType: messageUtil.MESSAGE_CHAT_TYPES.GROUP,
                  messageType: messageUtil.MESSAGE_TYPES.IMAGE,
                  fileName: `${uuid}.${file.name}`,
                  createdAt: Date.now(),
                };
                let newMessage = await axios.post(http + '/messages', newMessageItem);
                //cập nhật thời gian
                this.updateTimeForGroup(receiverId);
                return newMessage.data;
              }
              //nếu là file 
              else {
                let newMessageItem = {
                  senderId: senderId,
                  receiverId: receiverId,
                  isRead: false,
                  chatType: messageUtil.MESSAGE_CHAT_TYPES.GROUP,
                  messageType: messageUtil.MESSAGE_TYPES.FILE,
                  fileName: `${uuid}.${file.name}`,
                  createdAt: Date.now(),
                };
                let newMessage = await axios.post(http + '/messages', newMessageItem);
                //cập nhật thời gian
                this.updateTimeForGroup(receiverId);
                return newMessage.data;
              }
            });
            //upload S3
            let newFiles = await FilesUtil.uploadFiles(files, uuid);
            return resolve({
              newMessages: await Promise.all(getNewMessages),
              newFiles: newFiles
            });
          }
          //nếu là cá nhân
          else {
            let getNewMessages = files.map(async (file) => {
              //kiểm tra image hay file
              let mimeType = file.mimetype.split('/')[0];
              //nếu là image
              if (mimeType === 'image') {
                let newMessageItem = {
                  senderId: senderId,
                  receiverId: receiverId,
                  isRead: false,
                  chatType: messageUtil.MESSAGE_CHAT_TYPES.PERSONAL,
                  messageType: messageUtil.MESSAGE_TYPES.IMAGE,
                  fileName: `${uuid}.${file.name}`,
                  createdAt: Date.now(),
                };
                let newMessage = await axios.post(http + '/messages', newMessageItem);
                //cập nhật thời gian
                this.updateTimeForUser(senderId, receiverId);
                return newMessage.data;
              }
              //nếu là file
              else {
                let newMessageItem = {
                  senderId: senderId,
                  receiverId: receiverId,
                  isRead: false,
                  chatType: messageUtil.MESSAGE_CHAT_TYPES.PERSONAL,
                  messageType: messageUtil.MESSAGE_TYPES.FILE,
                  fileName: `${uuid}.${file.name}`,
                  createdAt: Date.now(),
                };
                let newMessage = await axios.post(http + '/messages', newMessageItem);
                //cập nhật thời gian
                this.updateTimeForUser(senderId, receiverId);
                return newMessage.data;
              }
            });
            //upload S3
            let newFiles = await FilesUtil.uploadFiles(files, uuid);
            return resolve({
              newMessages: await Promise.all(getNewMessages),
              newFiles: newFiles
            });
          }
        }
        //upload 1 file vào message
        else {
          //kiểm tra image hay file
          let mimeType = files.mimetype.split('/')[0];
          //nếu là nhóm
          if (isChatGroup === 'true') {
            //nếu là image
            if (mimeType === 'image') {
              //tạo tin nhắn mới
              let newMessageItem = {
                senderId: senderId,
                receiverId: receiverId,
                isRead: false,
                chatType: messageUtil.MESSAGE_CHAT_TYPES.GROUP,
                messageType: messageUtil.MESSAGE_TYPES.IMAGE,
                fileName: `${uuid}.${files.name}`,
                createdAt: Date.now(),
              };
              let newMessage = await axios.post(http + '/messages', newMessageItem);
              //cập nhật thời gian
              this.updateTimeForGroup(receiverId);
              //upload S3
              let newFiles = await FilesUtil.uploadFiles(files, uuid);
              return resolve({
                newMessages: newMessage.data,
                newFiles: newFiles
              });
            }
            //nếu là file
            else {
              //tạo tin nhắn mới
              let newMessageItem = {
                senderId: senderId,
                receiverId: receiverId,
                isRead: false,
                chatType: messageUtil.MESSAGE_CHAT_TYPES.GROUP,
                messageType: messageUtil.MESSAGE_TYPES.FILE,
                fileName: `${uuid}.${files.name}`,
                createdAt: Date.now(),
              };
              let newMessage = await axios.post(http + '/messages', newMessageItem);
              //cập nhật thời gian
              this.updateTimeForGroup(receiverId);
              //upload S3
              let newFiles = await FilesUtil.uploadFiles(files, uuid);
              return resolve({
                newMessages: newMessage.data,
                newFiles: newFiles
              });
            }
          }
          //nếu là cá nhân
          else {
            //nếu là image
            if (mimeType === 'image') {
              //tạo tin nhắn mới
              let newMessageItem = {
                senderId: senderId,
                receiverId: receiverId,
                isRead: false,
                chatType: messageUtil.MESSAGE_CHAT_TYPES.PERSONAL,
                messageType: messageUtil.MESSAGE_TYPES.IMAGE,
                fileName: `${uuid}.${files.name}`,
                createdAt: Date.now(),
              };
              let newMessage = await axios.post(http + '/messages', newMessageItem);
              //cập nhật thời gian
              this.updateTimeForUser(senderId, receiverId);
              //upload S3
              let newFiles = await FilesUtil.uploadFiles(files, uuid);
              return resolve({
                newMessages: newMessage.data,
                newFiles: newFiles
              });
            }
            //nếu là file
            else {
              //tạo tin nhắn mới
              let newMessageItem = {
                senderId: senderId,
                receiverId: receiverId,
                isRead: false,
                chatType: messageUtil.MESSAGE_CHAT_TYPES.PERSONAL,
                messageType: messageUtil.MESSAGE_TYPES.FILE,
                fileName: `${uuid}.${files.name}`,
                createdAt: Date.now(),
              };
              let newMessage = await axios.post(http + '/messages', newMessageItem);
              //cập nhật thời gian
              this.updateTimeForUser(senderId, receiverId);
              //upload S3
              let newFiles = await FilesUtil.uploadFiles(files, uuid);
              return resolve({
                newMessages: newMessage.data,
                newFiles: newFiles
              });
            }
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteText(messageId) {
    return new Promise(async (resolve, reject) => {
      await axios.delete(http + '/messages/' + messageId)
        .then(resolve(true))
        .catch(reject(false));
    });
  }

  async deleteFile(messageId) {
    return new Promise(async (resolve, reject) => {
      try {
        let getMessage = await axios.get(http + '/messages/' + messageId);
        // xóa file S3
        FilesUtil.deleteFile(getMessage.data.fileName);
        // xóa tin nhắn trong db
        await axios.delete(http + '/messages/' + messageId);
        return resolve(true);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async deleteConversation(messages) {
    return new Promise(async (resolve, reject) => {
      try {
        messages.forEach(async message => {
          await axios.delete(http + '/messages/' + message._id);
        });
        return resolve(true);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async updateReaction(messageId, userId, icon) {
    return new Promise(async (resolve, reject) => {
      try {
        let message = await axios.get(http + '/messages/' + messageId);
        let reaction = {
          userId: userId,
          react: icon
        }
        message.data.reaction = [];
        message.data.reaction.push(reaction);
        await axios.put(http + '/messages/' + messageId, message.data);
        return resolve(message.data);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async removeReaction(messageId) {
    return new Promise(async (resolve, reject) => {
      try {
        let message = await axios.get(http + '/messages/' + messageId);
        message.data.reaction = [];
        await axios.put(http + '/messages/' + messageId, message.data);
        return resolve(message.data);
      } catch (error) {
        return reject(error);
      }
    });
  }

  // cập nhật tin nhắn đã đọc
  async updateIsRead(message) {
    return new Promise(async (resolve, reject) => {
      try {
        message.isRead = true;
        await axios.put(http + '/messages/' + message._id, message);
        return resolve(true);
      } catch (error) {
        return reject(error);
      }
    });
  }

  // cập nhật thời gian
  async updateTimeForUser(senderId, receiverId) {
    let getSender = await axios.get(http + '/users/' + senderId);
    let getReceiver = await axios.get(http + '/users/' + receiverId);
    let sender = getSender.data.user;
    let receiver = getReceiver.data.user;
    sender.updatedAt = Date.now();
    receiver.updatedAt = Date.now();
    await axios.put(http + '/users/' + senderId, sender);
    await axios.put(http + '/users/' + receiverId, receiver);
  }

  // cập nhật thời gian và số lượng tin nhắn của nhóm
  async updateTimeForGroup(receiverId) {
    let getChatGroupReceiver = await axios.get(http + '/chatGroups/' + receiverId);
    let chatGroup = getChatGroupReceiver.data;
    chatGroup.updatedAt = Date.now();
    await axios.put(http + '/chatGroups/' + receiverId, chatGroup);
  }
}

module.exports = new MessageService();
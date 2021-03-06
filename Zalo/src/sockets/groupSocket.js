const {
    addSocketId,
    sendEvent,
    deleteSocketId
} = require('../utils/socket')
class groupSocket {
    createGroup(io) {
        let listUsers = {};
        io.on('connection', (socket) => {
            // let sender = socket.request.user.data.user;
            // let cookie = decodeURIComponent(socket.request.headers.cookie);
            // let sender = JSON.parse(cookie.split('userCookie=')[1]);
            socket.on('send-user', (sender) => {
                listUsers = addSocketId(listUsers, sender._id, socket.id);
                //thêm socketid vào đối tượng listUsers vào nhóm của người đăng nhập
                sender.chatGroupIds.forEach((groupId) => {
                    listUsers = addSocketId(listUsers, groupId, socket.id);
                });
                //lắng nghe socket từ client gửi
                socket.on('create-group', (data) => {
                    listUsers = addSocketId(listUsers, data.group._id, socket.id);
                    let response = {
                        group: data.group
                    };
                    let members = data.group.members.filter(member => member.userId != sender._id);
                    members.forEach(members => {
                        //gửi socket đến cho client
                        if (listUsers[members.userId]) {
                            sendEvent(listUsers, members.userId, io, 'response-create-group', response);
                        }
                    });
                });

                //lắng nghe socket từ client gửi
                socket.on('members-get-socketId', (data) => {
                    listUsers = addSocketId(listUsers, data.group._id, socket.id);
                });

                //xóa id socket mỗi khi socket disconnect
                socket.on('disconnect', () => {
                    listUsers = deleteSocketId(listUsers, sender._id, socket);
                    sender.chatGroupIds.forEach((groupId) => {
                        listUsers = deleteSocketId(listUsers, groupId, socket);
                    });
                });
            });
        });
    }

    addUserToGroup(io) {
        let listUsers = {};
        io.on('connection', (socket) => {
            //let sender = socket.request.user.data.user;
            // let cookie = decodeURIComponent(socket.request.headers.cookie);
            // let sender = JSON.parse(cookie.split('userCookie=')[1]);
            socket.on('send-user', (sender) => {
                listUsers = addSocketId(listUsers, sender._id, socket.id);
                //thêm socketid vào đối tượng listUsers vào nhóm của người đăng nhập
                sender.chatGroupIds.forEach((groupId) => {
                    listUsers = addSocketId(listUsers, groupId, socket.id);
                });
                //lắng nghe socket từ client gửi
                socket.on('add-user-to-group', (data) => {
                    listUsers = addSocketId(listUsers, data.group._id, socket.id);
                    let response = {
                        group: data.group,
                        membersPre: data.membersPre
                    };
                    let members = data.group.members.filter(member => member.userId != sender._id);
                    members.forEach(member => {
                        //gửi socket đến cho client
                        if (listUsers[member.userId]) {
                            sendEvent(listUsers, member.userId, io, 'response-add-user-to-group', response);
                        }
                    });
                });
                //xóa id socket mỗi khi socket disconnect
                socket.on('disconnect', () => {
                    listUsers = deleteSocketId(listUsers, sender._id, socket);
                    sender.chatGroupIds.forEach((groupId) => {
                        listUsers = deleteSocketId(listUsers, groupId, socket);
                    });
                });
            });
        });
    }

    deleteGroup(io) {
        let listUsers = {};
        io.on('connection', (socket) => {
            //let sender = socket.request.user.data.user;
            // let cookie = decodeURIComponent(socket.request.headers.cookie);
            // let sender = JSON.parse(cookie.split('userCookie=')[1]);
            socket.on('send-user', (sender) => {
                listUsers = addSocketId(listUsers, sender._id, socket.id);
                //thêm socketid vào đối tượng listUsers vào nhóm của người đăng nhập
                sender.chatGroupIds.forEach((groupId) => {
                    listUsers = addSocketId(listUsers, groupId, socket.id);
                });

                //khi tạo nhóm mới => thêm socketid của nhóm
                socket.on('create-group', (data) => {
                    listUsers = addSocketId(listUsers, data.group._id, socket.id);
                });

                socket.on('members-get-socketId', (data) => {
                    listUsers = addSocketId(listUsers, data.group._id, socket.id);
                });

                //lắng nghe socket từ client gửi
                socket.on('delete-group', (data) => {
                    let response = {
                        groupId: data.groupId,
                    };
                    if (listUsers[data.groupId]) {
                        sendEvent(listUsers, data.groupId, io, 'response-delete-group', response);
                    }
                });
                //xóa id socket mỗi khi socket disconnect
                socket.on('disconnect', () => {
                    listUsers = deleteSocketId(listUsers, sender._id, socket);
                    sender.chatGroupIds.forEach((groupId) => {
                        listUsers = deleteSocketId(listUsers, groupId, socket);
                    });
                });
            });
        });
    }

    leaveGroup(io) {
        let listUsers = {};
        io.on('connection', (socket) => {
            // let cookie = decodeURIComponent(socket.request.headers.cookie);
            // let sender = JSON.parse(cookie.split('userCookie=')[1]);
            socket.on('send-user', (sender) => {
                listUsers = addSocketId(listUsers, sender._id, socket.id);
                //thêm socketid vào đối tượng listUsers vào nhóm của người đăng nhập
                sender.chatGroupIds.forEach((groupId) => {
                    listUsers = addSocketId(listUsers, groupId, socket.id);
                });
                //lắng nghe socket từ client gửi
                socket.on('leave-group', (data) => {
                    let response = {
                        group: data.group
                    };
                    let members = data.group.members.filter(member => member.userId != sender._id);
                    members.forEach(members => {
                        if (listUsers[members.userId]) {
                            sendEvent(listUsers, members.userId, io, 'response-leave-group', response);
                        }
                    });
                });
                //xóa id socket mỗi khi socket disconnect
                socket.on('disconnect', () => {
                    listUsers = deleteSocketId(listUsers, sender._id, socket);
                    sender.chatGroupIds.forEach((groupId) => {
                        listUsers = deleteSocketId(listUsers, groupId, socket);
                    });
                });
            });
        });
    }
}
module.exports = new groupSocket;
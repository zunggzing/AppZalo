const contactSocket = require('./contactSocket');
const messageSocket = require('./messageSocket');
const videoCallSocket = require('./videoCallSocket');

function initSockets(io) {
    contactSocket.addNewContact(io);
    contactSocket.removeRequestContact(io);
    contactSocket.removeRequestContactReceiver(io);
    contactSocket.acceptContact(io);
    contactSocket.removeFriend(io);

    messageSocket.addNewTextAndEmoji(io);
    messageSocket.addNewFile(io);
    messageSocket.updateTime(io);
    messageSocket.deleteTextAndEmoji(io);

    videoCallSocket.videoCall(io);

}

module.exports = initSockets;
//xu ly tu choi ket ban
function removeRequestContactReceiver() {
    $('#btn-cancel-friend-receiver').on('click', function (e) {
        e.preventDefault();
        let senderId = $(this).data('uid');
        $.ajax({
            url: '/contact/removeReceiver',
            type: 'delete',
            data: {
                uid: senderId,
            },
            success: function (data) {
                if (data.success) {
                    $('#notification-contact')
                        .find(`li[data-uid = ${senderId}]`)
                        .remove();

                    socket.emit('remove-request-contact-receiver', {
                        senderId: senderId,
                    });
                }
            },
        });
    });
}

socket.on('response-remove-request-contact-receiver', function (user) {
    $('#btn-add-cancel-friend')
        .find(`div#btn-cancel-friend[data-uid = ${user.id}]`)
        .hide(),
        $('#btn-add-cancel-friend')
        .find(`div#btn-add-friend[data-uid = ${user.id}]`)
        .css('display', 'inline-block'),
        addNewContact();
});

$(document).ready(function () {
    removeRequestContactReceiver();
});

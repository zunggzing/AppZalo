//xu ly accept ket ban
function acceptFriendRequest() {
    $('#btn-accept-friend').off('click').on('click', function (e) {
        e.preventDefault();
        let senderId = $(this).data('uid');
        $.ajax({
            url: '/contact/accept',
            type: 'put',
            data: {
                userId: senderId,
            },
            success: function (data) {
                if (data.success) {
                    $('#notification-contact').find(`li[data-uid = ${senderId}]`).remove();
                    sumOfNotificationDes();
                    showBtnAddAndRemove(senderId);
                    $.get(http + `/users/${senderId}`, function (data, status) {
                        let sender = data.user;
                        let isChatGroup = false;
                        if (status === 'success') {
                            sumOfContactInc();
                            $('#contact-list').prepend(contact(sender));
                            addConversation(sender._id, isChatGroup)
                                .then(function (result) {
                                    $('#conversation-list').prepend(result);
                                });
                            window.location.href = `/home`;
                        }
                    });
                    //emit id của người gửi cho server
                    socket.emit('accept-Friend-Request', {
                        senderId: senderId,
                    });
                }
            },
        });
    });
}


socket.on('response-accept-Friend-Request', async function (data) {
    let isChatGroup = false;
    sumOfContactInc();
    showBtnAddAndRemove(data._id);
    let getUser = await $.get(http + `/users/${data._id}`);
    $('#contact-list').prepend(contact(data));
    addConversation(getUser.user._id, isChatGroup)
        .then(function (result) {
            $('#conversation-list').prepend(result);
        });
        window.location.href = `/home`;
});

function sumOfContactInc() {
    let sum = $('#sumOfContact').attr('data-sum');
    sum++;
    $('#sumOfContact').attr('data-sum', sum);
    $('#sumOfContact').html('');
    $('<span>Bạn bè(' + sum + ')</span>').appendTo($('#sumOfContact'));
}

function contact(user) {
    let contact = `<li data-uid = '${user._id}'
    <div class="d-flex align-items-center">
        <div class="flex-1 d-flex align-items-center">
            <img src="${s3}/${user.avatar}"
                class="rounded-circle avatar-xs me-3"
                alt="${user.userName}">
            <h5 class="font-size-14 m-0">${user.userName}</h5>
        </div>
        <div class="dropdown">
            <a href="javascript:void(0)"
                class="text-muted dropdown-toggle"
                data-bs-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false">
                <i class="fal fa-ellipsis-v"
                    style="font-size: 20px; padding: 0 12px;"></i>
            </a>
            <div class="dropdown-menu dropdown-menu-end">
                <div>
                <a onclick="showDetailsProfile('${user._id}')"
                class="dropdown-item d-flex align-items-center justify-content-between"
                data-bs-toggle="modal"
                data-bs-target="#modal-show-profile"><span>Hồ
                    sơ</span>
                <i
                    class="fal fa-user-circle float-end text-muted"></i>
            </a>
                </div>
                <a class="dropdown-item"
                    href="javascript:void(0)">Block
                    <i
                        class="fal fa-ban float-end text-muted"></i></a>
                <a class="dropdown-item" onclick="deleteFriend('${user._id}')">Remove
                    <i
                        class="fal fa-trash-alt float-end text-muted"></i></a>
            </div>

        </div>
    </div>
</li>`;
    return contact;
}

function sumOfNotificationDes() {
    let sum = $('#sumOfNotification').attr('data-sum');
    sum = sum - 1;
    $('#sumOfNotification').attr('data-sum', sum);
    $('#sumOfNotification').html('');
    $('<span>(' + sum + ')</span>').appendTo($('#sumOfNotification'));
}
//hiển thị tin nhắn nhóm
async function showConversationGroup(id) {
    let group = await $.get(http + `/chatGroups/${id}`);
    let currentUserId = document.getElementById('id').value;
    let sender = await $.get(http + `/users/${currentUserId}`);
    // lấy tin nhắn theo id nhóm
    let messages = await $.get(http + `/messages/SearchByReceiverId/${id}`);
    //hiển thị tên nhóm
    $('#name-conversation').html(`${group.name}`);
    //phía gửi: gán giá trị data-id = id hiện tại
    $('#right-conversation').attr('data-id', `${currentUserId}`);
    //phía gửi: lấy id đã gán
    let rightId = $('#right-conversation').attr('data-id');
    $('#conversation').html('');
    messages.map(async (message) => {
        let receiver = await $.get(http + `/users/${message.senderId}`);
        $('#conversation').append(leftConversationText(receiver, {
            text: null
        }));
        $(`#left-conversation-${receiver.user._id}`).attr('data-id', `${receiver.user._id}`);
        if (message.messageType === 'text') {
            if (message.senderId === rightId) {
                $('#conversation').append(rightConversationText(sender, message));
                $('#conversation').find(`li[data-content = null]`).remove();
            }
            if (message.senderId === $(`#left-conversation-${receiver.user._id}`).attr('data-id') && message.senderId !== currentUserId) {
                $('#conversation').append(leftConversationText(receiver, message));
                $('#conversation').find(`li[data-content = null]`).remove();
            }
        }
        if (message.messageType === 'image') {
            if (message.senderId === rightId) {
                $('#conversation').append(rightConversationImage(sender, message));
                $('#conversation').find(`li[data-content = null]`).remove();
            }
            if (message.senderId === $(`#left-conversation-${receiver.user._id}`).attr('data-id') && message.senderId !== currentUserId) {
                $('#conversation').append(leftConversationImage(receiver, message));
                $('#conversation').find(`li[data-content = null]`).remove();
            }
        }
        if(message.messageType === 'file'){
            if (message.senderId === rightId) {
                $('#conversation').append(rightConversationFile(sender, message));
                $('#conversation').find(`li[data-content = null]`).remove();
            }
            if (message.senderId === $(`#left-conversation-${receiver.user._id}`).attr('data-id') && message.senderId !== currentUserId) {
                $('#conversation').append(leftConversationFile(receiver, message));
                $('#conversation').find(`li[data-content = null]`).remove();
            }
        }

    })
}

//hiển thị tin nhắn cá nhân
async function showConversationUser(id) {
    let currentUserId = document.getElementById('id').value;
    let receiver = await $.get(http + `/users/${id}`);
    let sender = await $.get(http + `/users/${currentUserId}`);
    let messages = await $.get(http + `/messages/SearchBySenderIdAndReceiverId/${currentUserId}/${id}`);
    $('#name-conversation').html(`${receiver.user.userName}`);
    $('#right-conversation').attr('data-id', `${currentUserId}`);
    $('#conversation').append(leftConversationText(receiver, {
        text: ''
    }));
    $(`#left-conversation-${receiver.user._id}`).attr('data-id', `${id}`);
    let rightId = $('#right-conversation').attr('data-id');
    let leftId = $(`#left-conversation-${receiver.user._id}`).attr('data-id');
    $('#conversation').html('');
    messages.forEach(message => {
        if (message.messageType === 'text') {
            if (message.senderId === rightId) {
                $('#conversation').append(rightConversationText(sender, message));
            }
            if (message.senderId === leftId) {
                $('#conversation').append(leftConversationText(receiver, message));
            }
        }
        if (message.messageType === 'image') {
            if (message.senderId === rightId) {
                $('#conversation').append(rightConversationImage(sender, message));
            }
            if (message.senderId === leftId) {
                $('#conversation').append(leftConversationImage(receiver, message));
            }
        }
        if(message.messageType === 'file'){
            if (message.senderId === rightId) {
                $('#conversation').append(rightConversationFile(sender, message));
            }
            if (message.senderId === leftId) {
                $('#conversation').append(leftConversationFile(receiver, message));
            }
        }

    });
}

//tạo tin nhắn text gửi đi
function rightConversationText(user, message) {
    return `<li class="right" id="right-conversation" data-id="${user.user._id}">
    <div class="conversation-list">
        <div class="chat-avatar">
            <img src="images/${user.user.avatar}" alt="">
        </div>

        <div class="user-chat-content">
            <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                    <p class="mb-0" id="content-conversation">
                        ${message.text}
                    </p>
                    <p class="chat-time mb-0"><i
                            class="fal fa-clock align-middle"></i> <span
                            class="align-middle">10:02</span></p>
                </div>

                <div class="dropdown align-self-start">
                    <a class="dropdown-toggle" href="javascript:void(0)"
                        role="button" data-bs-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        <i class="fal fa-ellipsis-v"></i>
                    </a>
                    <div class="dropdown-menu">
                        <a class="dropdown-item"
                            href="javascript:void(0)">Sao chép
                            <i
                                class="fal fa-copy float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Lưu
                            <i
                                class="fal fa-save float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Chuyển tiếp
                            <i
                                class="fal fa-share float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Xoá
                            <i
                                class="fal fa-trash-alt float-end text-muted"></i></a>
                    </div>
                </div>
            </div>

            <div class="conversation-name">${user.user.userName}</div>
        </div>
    </div>
</li>`;
}

//tạo tin nhắn text nhận
function leftConversationText(user, message) {
    return `<li id="left-conversation-${user.user._id}" data-id="${user.user._id}"  data-content="${message.text}">
    <div class="conversation-list">
        <div class="chat-avatar">
            <img src="images/${user.user.avatar}"
                alt="">
        </div>

        <div class="user-chat-content">
            <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                    <p class="mb-0" id="content-conversation">
                    ${message.text}
                    </p>
                    <p class="chat-time mb-0"><i
                            class="fal fa-clock align-middle"></i> <span
                            class="align-middle">10:00</span></p>
                </div>
                <div class="dropdown align-self-start">
                    <a class="dropdown-toggle" href="javascript:void(0)"
                        role="button" data-bs-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        <i class="fal fa-ellipsis-v"></i>
                    </a>
                    <div class="dropdown-menu">
                        <a class="dropdown-item"
                            href="javascript:void(0)">Sao chép
                            <i
                                class="fal fa-copy float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Lưu
                            <i
                                class="fal fa-save float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Chuyển tiếp
                            <i
                                class="fal fa-share float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Xoá
                            <i
                                class="fal fa-trash-alt float-end text-muted"></i></a>
                    </div>
                </div>
            </div>
            <div class="conversation-name">${user.user.userName}</div>
        </div>
    </div>
</li>`;
}

//tạo tin nhắn image gửi đi
function rightConversationImage(user, message) {
    return `<li class="right" id="right-conversation" data-id="${user.user._id}">
    <div class="conversation-list">
        <div class="chat-avatar">
            <img src="/images/${user.user.avatar}"
                alt="">
        </div>

        <div class="user-chat-content">
            <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                    <ul class="list-inline message-img  mb-0">
                        <li class="list-inline-item message-img-list me-2 ms-0">
                            <div>
                                <a class="popup-img d-inline-block m-1"
                                    href="./assets/img-1.jpg"
                                    title="Project 1">
                                    <img src="/images/${message.file.fileName}" alt=""
                                        class="rounded border">
                                </a>
                            </div>
                            <div class="message-img-link">
                                <ul class="list-inline mb-0">
                                    <li class="list-inline-item">
                                        <a href="javascript:void(0)">
                                            <i class="fal fa-download"></i>
                                        </a>
                                    </li>
                                    <li class="list-inline-item dropdown">
                                        <a class="dropdown-toggle"
                                            href="javascript:void(0)"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false">
                                            <i
                                                class="fal fa-ellipsis-h"></i>
                                        </a>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Sao
                                                chép
                                                <i
                                                    class="fal fa-copy float-end text-muted"></i></a>
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Lưu
                                                <i
                                                    class="fal fa-save float-end text-muted"></i></a>
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Chuyển
                                                tiếp
                                                <i
                                                    class="fal fa-share float-end text-muted"></i></a>
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Xoá
                                                <i
                                                    class="fal fa-trash-alt float-end text-muted"></i></a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li class="list-inline-item message-img-list">
                            <div>
                                <a class="popup-img d-inline-block m-1"
                                    href="./assets/img-2.jpg"
                                    title="Project 2">
                                    <img src="/images/${message.file.fileName}" alt=""
                                        class="rounded border">
                                </a>
                            </div>
                            <div class="message-img-link">
                                <ul class="list-inline mb-0">
                                    <li class="list-inline-item">
                                        <a href="javascript:void(0)">
                                            <i class="fal fa-download"></i>
                                        </a>
                                    </li>
                                    <li class="list-inline-item dropdown">
                                        <a class="dropdown-toggle"
                                            href="javascript:void(0)"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false">
                                            <i
                                                class="fal fa-ellipsis-h"></i>
                                        </a>
                                        <div
                                            class="dropdown-menu dropdown-menu-end">
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Sao
                                                chép
                                                <i
                                                    class="fal fa-copy float-end text-muted"></i></a>
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Lưu
                                                <i
                                                    class="fal fa-save float-end text-muted"></i></a>
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Chuyển
                                                tiếp
                                                <i
                                                    class="fal fa-share float-end text-muted"></i></a>
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Xoá
                                                <i
                                                    class="fal fa-trash-alt float-end text-muted"></i></a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                    <p class="chat-time mb-0"><i
                            class="fal fa-clock align-middle"></i> <span
                            class="align-middle">10:09</span></p>
                </div>

                <div class="dropdown align-self-start">
                    <a class="dropdown-toggle" href="javascript:void(0)"
                        role="button" data-bs-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        <i class="fal fa-ellipsis-v"></i>
                    </a>
                    <div class="dropdown-menu">
                        <a class="dropdown-item"
                            href="javascript:void(0)">Sao chép
                            <i
                                class="fal fa-copy float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Lưu
                            <i
                                class="fal fa-save float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Chuyển tiếp
                            <i
                                class="fal fa-share float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Xoá
                            <i
                                class="fal fa-trash-alt float-end text-muted"></i></a>
                    </div>
                </div>

            </div>

            <div class="conversation-name">${user.user.userName}</div>
        </div>

    </div>
</li>`;
}

//tạo tin nhắn image nhận
function leftConversationImage(user, message) {
    return `<li id="left-conversation-${user.user._id}" data-id="${user.user._id}" data-content="${message.text}">
     <div class="conversation-list">
         <div class="chat-avatar">
             <img src="/images/${user.user.avatar}"
                 alt="">
         </div>

         <div class="user-chat-content">
             <div class="ctext-wrap">
                 <div class="ctext-wrap-content">
                     <ul class="list-inline message-img  mb-0">
                         <li class="list-inline-item message-img-list me-2 ms-0">
                             <div>
                                 <a class="popup-img d-inline-block m-1"
                                     href="./assets/img-1.jpg"
                                     title="Project 1">
                                     <img src="/images/${message.file.fileName}" alt=""
                                         class="rounded border">
                                 </a>
                             </div>
                             <div class="message-img-link">
                                 <ul class="list-inline mb-0">
                                     <li class="list-inline-item">
                                         <a href="javascript:void(0)">
                                             <i class="fal fa-download"></i>
                                         </a>
                                     </li>
                                     <li class="list-inline-item dropdown">
                                         <a class="dropdown-toggle"
                                             href="javascript:void(0)"
                                             role="button"
                                             data-bs-toggle="dropdown"
                                             aria-haspopup="true"
                                             aria-expanded="false">
                                             <i
                                                 class="fal fa-ellipsis-h"></i>
                                         </a>
                                         <div class="dropdown-menu">
                                             <a class="dropdown-item"
                                                 href="javascript:void(0)">Sao
                                                 chép
                                                 <i
                                                     class="fal fa-copy float-end text-muted"></i></a>
                                             <a class="dropdown-item"
                                                 href="javascript:void(0)">Lưu
                                                 <i
                                                     class="fal fa-save float-end text-muted"></i></a>
                                             <a class="dropdown-item"
                                                 href="javascript:void(0)">Chuyển
                                                 tiếp
                                                 <i
                                                     class="fal fa-share float-end text-muted"></i></a>
                                             <a class="dropdown-item"
                                                 href="javascript:void(0)">Xoá
                                                 <i
                                                     class="fal fa-trash-alt float-end text-muted"></i></a>
                                         </div>
                                     </li>
                                 </ul>
                             </div>
                         </li>

                         <li class="list-inline-item message-img-list">
                             <div>
                                 <a class="popup-img d-inline-block m-1"
                                     href="./assets/img-2.jpg"
                                     title="Project 2">
                                     <img src="/images/${message.file.fileName}" alt=""
                                         class="rounded border">
                                 </a>
                             </div>
                             <div class="message-img-link">
                                 <ul class="list-inline mb-0">
                                     <li class="list-inline-item">
                                         <a href="javascript:void(0)">
                                             <i class="fal fa-download"></i>
                                         </a>
                                     </li>
                                     <li class="list-inline-item dropdown">
                                         <a class="dropdown-toggle"
                                             href="javascript:void(0)"
                                             role="button"
                                             data-bs-toggle="dropdown"
                                             aria-haspopup="true"
                                             aria-expanded="false">
                                             <i
                                                 class="fal fa-ellipsis-h"></i>
                                         </a>
                                         <div
                                             class="dropdown-menu dropdown-menu-end">
                                             <a class="dropdown-item"
                                                 href="javascript:void(0)">Sao
                                                 chép
                                                 <i
                                                     class="fal fa-copy float-end text-muted"></i></a>
                                             <a class="dropdown-item"
                                                 href="javascript:void(0)">Lưu
                                                 <i
                                                     class="fal fa-save float-end text-muted"></i></a>
                                             <a class="dropdown-item"
                                                 href="javascript:void(0)">Chuyển
                                                 tiếp
                                                 <i
                                                     class="fal fa-share float-end text-muted"></i></a>
                                             <a class="dropdown-item"
                                                 href="javascript:void(0)">Xoá
                                                 <i
                                                     class="fal fa-trash-alt float-end text-muted"></i></a>
                                         </div>
                                     </li>
                                 </ul>
                             </div>
                         </li>
                     </ul>
                     <p class="chat-time mb-0"><i
                             class="fal fa-clock align-middle"></i> <span
                             class="align-middle">10:09</span></p>
                 </div>

                 <div class="dropdown align-self-start">
                     <a class="dropdown-toggle" href="javascript:void(0)"
                         role="button" data-bs-toggle="dropdown"
                         aria-haspopup="true" aria-expanded="false">
                         <i class="fal fa-ellipsis-v"></i>
                     </a>
                     <div class="dropdown-menu">
                         <a class="dropdown-item"
                             href="javascript:void(0)">Sao chép
                             <i
                                 class="fal fa-copy float-end text-muted"></i></a>
                         <a class="dropdown-item"
                             href="javascript:void(0)">Lưu
                             <i
                                 class="fal fa-save float-end text-muted"></i></a>
                         <a class="dropdown-item"
                             href="javascript:void(0)">Chuyển tiếp
                             <i
                                 class="fal fa-share float-end text-muted"></i></a>
                         <a class="dropdown-item"
                             href="javascript:void(0)">Xoá
                             <i
                                 class="fal fa-trash-alt float-end text-muted"></i></a>
                     </div>
                 </div>

             </div>

             <div class="conversation-name">${user.user.userName}</div>
         </div>

     </div>
 </li>`;
}

//tạo tin nhắn file gửi đi
function rightConversationFile(user, message) {
    return `<li class="right"  id="right-conversation" data-id="${user.user._id}">
    <div class="conversation-list">
        <div class="chat-avatar">
            <img src="/images/${user.user.avatar}" alt="">
        </div>

        <div class="user-chat-content">
            <div class="ctext-wrap">

                <div class="ctext-wrap-content">
                    <div class="card p-2 mb-2">
                        <div
                            class="d-flex flex-wrap align-items-center attached-file">
                            <div
                                class="avatar-sm me-3 ms-0 attached-file-avatar">
                                <div
                                    class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                                    <i class="fal fa-file-alt"></i>
                                </div>
                            </div>
                            <div class="flex-1 overflow-hidden">
                                <div class="text-start">
                                    <h5
                                        class="font-size-14 text-truncate mb-1">
                                        ${message.file.fileName}</h5>
                                    <p
                                        class="text-muted text-truncate font-size-13 mb-0">
                                        12.5 MB</p>
                                </div>
                            </div>
                            <div class="ms-4 me-0">
                                <div
                                    class="d-flex gap-2 font-size-20 d-flex align-items-start">
                                    <div>
                                        <a href="javascript:void(0)"
                                            class="text-muted">
                                            <i class="fal
                                                    fa-download"></i>
                                        </a>
                                    </div>
                                    <div class="dropdown">
                                        <a class="dropdown-toggle text-muted"
                                            href="javascript:void(0)"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false">
                                            <i
                                                class="fal fa-ellipsis-h"></i>
                                        </a>
                                        <div
                                            class="dropdown-menu dropdown-menu-end">
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Chia
                                                sẻ
                                                <i
                                                    class="fal fa-share-alt float-end text-muted"></i></a>
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Xoá
                                                <i
                                                    class="fal fa-trash-alt float-end text-muted"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p class="chat-time mb-0"><i
                            class="fal fa-clock align-middle"></i> <span
                            class="align-middle">10:16</span></p>
                </div>

                <div class="dropdown align-self-start">
                    <a class="dropdown-toggle" href="javascript:void(0)"
                        role="button" data-bs-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        <i class="fal fa-ellipsis-v"></i>
                    </a>
                    <div class="dropdown-menu">
                        <a class="dropdown-item"
                            href="javascript:void(0)">Sao chép
                            <i
                                class="fal fa-copy float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Lưu
                            <i
                                class="fal fa-save float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Chuyển tiếp
                            <i
                                class="fal fa-share float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Xoá
                            <i
                                class="fal fa-trash-alt float-end text-muted"></i></a>
                    </div>
                </div>

            </div>

            <div class="conversation-name">${user.user.userName}</div>
        </div>

    </div>
</li>`;
}

//tạo tin nhắn file nhận
function leftConversationFile(user, message) {
    return `<li id="left-conversation-${user.user._id}" data-id="${user.user._id}" data-content="${message.text}">
    <div class="conversation-list">
        <div class="chat-avatar">
            <img src="/images/${user.user.avatar}" alt="">
        </div>

        <div class="user-chat-content">
            <div class="ctext-wrap">

                <div class="ctext-wrap-content">
                    <div class="card p-2 mb-2">
                        <div
                            class="d-flex flex-wrap align-items-center attached-file">
                            <div
                                class="avatar-sm me-3 ms-0 attached-file-avatar">
                                <div
                                    class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                                    <i class="fal fa-file-alt"></i>
                                </div>
                            </div>
                            <div class="flex-1 overflow-hidden">
                                <div class="text-start">
                                    <h5
                                        class="font-size-14 text-truncate mb-1">
                                        ${message.file.fileName}</h5>
                                    <p
                                        class="text-muted text-truncate font-size-13 mb-0">
                                        12.5 MB</p>
                                </div>
                            </div>
                            <div class="ms-4 me-0">
                                <div
                                    class="d-flex gap-2 font-size-20 d-flex align-items-start">
                                    <div>
                                        <a href="javascript:void(0)"
                                            class="text-muted">
                                            <i class="fal
                                                    fa-download"></i>
                                        </a>
                                    </div>
                                    <div class="dropdown">
                                        <a class="dropdown-toggle text-muted"
                                            href="javascript:void(0)"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false">
                                            <i
                                                class="fal fa-ellipsis-h"></i>
                                        </a>
                                        <div
                                            class="dropdown-menu dropdown-menu-end">
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Chia
                                                sẻ
                                                <i
                                                    class="fal fa-share-alt float-end text-muted"></i></a>
                                            <a class="dropdown-item"
                                                href="javascript:void(0)">Xoá
                                                <i
                                                    class="fal fa-trash-alt float-end text-muted"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p class="chat-time mb-0"><i
                            class="fal fa-clock align-middle"></i> <span
                            class="align-middle">10:16</span></p>
                </div>

                <div class="dropdown align-self-start">
                    <a class="dropdown-toggle" href="javascript:void(0)"
                        role="button" data-bs-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        <i class="fal fa-ellipsis-v"></i>
                    </a>
                    <div class="dropdown-menu">
                        <a class="dropdown-item"
                            href="javascript:void(0)">Sao chép
                            <i
                                class="fal fa-copy float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Lưu
                            <i
                                class="fal fa-save float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Chuyển tiếp
                            <i
                                class="fal fa-share float-end text-muted"></i></a>
                        <a class="dropdown-item"
                            href="javascript:void(0)">Xoá
                            <i
                                class="fal fa-trash-alt float-end text-muted"></i></a>
                    </div>
                </div>

            </div>

            <div class="conversation-name">${user.user.userName}</div>
        </div>

    </div>
</li>`;
}


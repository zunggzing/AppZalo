const NOTIFICATION_TYPES = {
  ADD_CONTACT: 'add_contact',
};

class NotificationUtil {
  getContent(notification_type, isRead, userId, userName, userAvatar) {
    var html = '';
    if (notification_type === NOTIFICATION_TYPES.ADD_CONTACT) {
      html += `<li class="position-relative" data-uid = '${userId}'>
            <a  style="width: 100%;">
                <div class="d-flex">
                    <div
                        class="chat-user-img away align-self-center me-3 ms-0">
                        <img src="images/${userAvatar}"
                            class="rounded-circle avatar-xs" alt="">
                        <span class="user-status"></span>
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <h5 class="text-truncate font-size-15 mb-1">
                        ${userName}</h5>
                        <p class="chat-user-message text-truncate mb-0">
                            Muốn kết bạn. "Xin chào, tôi là <span> ${userName}.
                        </p>
        
        
                    </div>
                </div>
            </a>
          <div class="d-flex justify-content-around">
            <a class="cursor-point"  id="btn-cancel-friend-receiver"  data-uid = '${userId}' >Bỏ qua</a>
            <a class="cursor-point" id="btn-accept-friend" data-uid = '${userId}' >Đồng ý</a>
          </div>
        </li>`;

      return html;
    }
    // html.split('"').join(' ')
  }
}
module.exports = {
  NOTIFICATION_TYPES: NOTIFICATION_TYPES,
  NotifitionUtil: new NotificationUtil(),
};

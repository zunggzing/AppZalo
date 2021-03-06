async function deleteConversation(id) {
    $('#delete-conversation').show();
    $('#leave-group').hide();
    $('#delete-group').hide();
    let currentUserId = document.getElementById('id').value;
    let messages = await $.get(http + `/messages/SearchBySenderIdAndReceiverId/${currentUserId}/${id}?startFrom=0`);
    if (messages.length > 0) {
        $('#delete-conversation').off('click').on('click', function () {
            $.ajax({
                url: '/message/deleteConversation',
                type: 'delete',
                data: {
                    messages: messages
                },
                success: function (data) {
                    if (data.success) {
                        $('#conversation-list').find(`li[id=receiver-${id}]`).find('#last-message-conversation').text('');
                        $('#conversation-list').find(`div[data-uid=${id}]`).text('');
                        $('#conversation-list').find(`li[id=receiver-${id}]`).hide();
                        getAllConversation();

                    }
                },
            });
        });
    }
}
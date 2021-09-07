const socketLive = io('/', { reconnect: true });
const scrollBar = document.querySelector('.chatBoxRight');
const friendDisplay = document.querySelectorAll('.friendDisplay');
const listOutFriendChatOnRight = document.querySelector(
  '.listOutFriendChatOnRight'
);
const nameStyle = document.querySelector('.nameStyle');
const imgAvatar = document.querySelector('.imgAvatar');
const ChatForm = document.querySelector('.ChatForm');
const inputTextSubmitBtn = document.querySelector('.inputTextSubmitBtn');

// Format Date
function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function scrollBarToBottom() {
  scrollBar.scrollTop = scrollBar.scrollHeight - scrollBar.clientHeight;
}

function appendChat(chatMessage, classToBeAdded, chatId, createdDate) {
  const newDiv = document.createElement('div');
  let innerHTML = `<div chatId= "${chatId}" class="commonInBothChat ${classToBeAdded}">
                      <div class="chatDropDownOptions" >
                          <div class="arrow down arrowDownBtn">
                          </div>
                      </div>
                      <div class="dropdownOptions" style="display:none;">`;
  if (classToBeAdded === 'chatFromYou') {
    innerHTML += `<div class="deleteChatBtn">Delete</div>`;
  }

  innerHTML += `<a href="#">Link 2</a>
                  <a href="#">Link 3</a>
                  </div>
                  ${chatMessage} 
                  <div class="createdDate">${createdDate}</div>
                  </div>`;
  newDiv.innerHTML = innerHTML;
  // newDiv.classList.add(classToBeAdded, 'commonInBothChat');
  //  -> hover
  document.querySelector('.chatBoxRight').append(newDiv);
  newDiv.addEventListener('mouseover', chatOnMouseOverFunction);
  newDiv.addEventListener('mouseout', chatOnMouseOutFunction);
  // -> dropDown
  newDiv
    .querySelector('.chatDropDownOptions')
    .addEventListener('click', dropdownOptions);
  //  -> delete chat
  if (classToBeAdded === 'chatFromYou') {
    newDiv
      .querySelector('.deleteChatBtn')
      .addEventListener('click', deleteSelectedChat);
  }
  scrollBarToBottom();
}

let recieverUserName = 'unknownForNow';
let recieverUserId = 'unknownForNow';
let senderId = undefined;
const senderUser = async () => {
  const response = await axios({
    method: 'GET',
    url: `/v1/users/GetMe`,
  });
  if (response.status == 200) {
    senderId = response.data.user._id;
  }
};
senderUser();

let roomId = undefined;
for (var i = 0; i < friendDisplay.length; i++) {
  friendDisplay[i].addEventListener('click', async (event) => {
    document.querySelector('.chatBoxRightDefault').style.display = 'none';
    const userName = event.target
      .closest('.friendDisplay')
      .querySelector('.nameLeftStyle').innerText;

    //user clicking at same username again and again
    if (recieverUserName != 'unknownForNow' && userName == recieverUserName) {
      return;
    }
    document.querySelector('.statusOnOffTyping').innerText = '';
    roomId = event.target.closest('.friendDisplay').getAttribute('chatRoomId');
    socketLive.emit('joinRoom', { roomId, userId: senderId });
    recieverUserName = userName;
    listOutFriendChatOnRight.style.display = 'block';
    nameStyle.innerText = userName;
    imgAvatar.src = event.target
      .closest('.friendDisplay')
      .querySelector('.friendDisplayAvatar').src;

    try {
      const responseFromGetUser = await axios({
        method: 'GET',
        url: `/v1/users/${recieverUserName}/username`,
      });
      if (responseFromGetUser.data.status == 'OK') {
        recieverUserId = responseFromGetUser.data.data.searchedUserId;
        socketLive.emit('statusOnOffTyping', {
          roomId,
          userId: recieverUserId,
        });
        const respo = await axios({
          method: 'GET',
          url: '/v1/chitChat/',
          params: {
            recieverUserId,
          },
        });
        const last50Chat = respo.data.last50Chat;
        document.querySelector('.chatBoxRight').innerHTML = '';
        for (let i = 0; i < last50Chat.length; i++) {
          const newDate = new Date(last50Chat[i].createdDate);
          const createdDate = formatDate(newDate);
          if (last50Chat[i].sender === recieverUserId) {
            appendChat(
              last50Chat[i].message,
              'chatFromFriend',
              last50Chat[i]._id,
              createdDate
            );
          } else {
            appendChat(
              last50Chat[i].message,
              'chatFromYou',
              last50Chat[i]._id,
              createdDate
            );
          }
        }
        document.querySelector('.chatBoxRightLoadingInterFace').style.display =
          'none';
        document.querySelector('.chatBoxRight').style.display = 'block';
      }
    } catch (err) {
      console.log(err);
    }

    // String.fromCodePoint(0x1F354)
    // var emojis = [0x1F600, 0x1F604, 0x1F34A, 0x1F344, 0x1F37F, 0x1F363, 0x1F370, 0x1F355,
    //     0x1F354, 0x1F35F, 0x1F6C0, 0x1F48E, 0x1F5FA, 0x23F0, 0x1F579, 0x1F4DA,
    //     0x1F431, 0x1F42A, 0x1F439, 0x1F424];

    scrollBarToBottom();
  });
}

const forwardChatToNext = async () => {
  const chatFromYou = document.querySelector('.inputText').value;
  if (chatFromYou == '') return;
  try {
    const response = await axios({
      method: 'POST',
      url: '/v1/chitChat/',
      data: {
        chatFromYou,
        recieverUserName,
      },
    });

    if (response.data.status == 'success') {
      const chatId = response.data.data._id;
      const createdDate = formatDate(new Date(response.data.data.createdDate));

      appendChat(chatFromYou, 'chatFromYou', chatId, createdDate);
      socketLive.emit('recieveChatFromClient', {
        chatFromYou,
        roomId,
        chatId,
        createdDate,
      });
      document.querySelector('.inputText').value = '';
      document.querySelector('.inputText').focus();
    }
  } catch (err) {
    console.log(err);
  }
};

ChatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  forwardChatToNext();
});
document.querySelector('.inputText').addEventListener('keypress', (event) => {
  if (event.key == 'Enter') {
    forwardChatToNext();
  }
});
document.querySelector('.inputText').addEventListener('keyup', () => {
  console.log('hello');
  socketLive.emit('statusOnOffTyping', {
    userId: recieverUserId,
    roomId,
  });
});
document.querySelector('.inputText').addEventListener('keydown', () => {
  socketLive.emit('statusOnOffTyping', {
    userId: recieverUserId,
    statusOnOffTyping: 'typing...',
    roomId,
  });
});
inputTextSubmitBtn.addEventListener('click', forwardChatToNext);

// hover feature to chats
const chatOnMouseOverFunction = (event) => {
  event.target
    .closest('.commonInBothChat')
    .querySelector('.chatDropDownOptions').style.display = 'block';
};
const chatOnMouseOutFunction = (event) => {
  event.target
    .closest('.commonInBothChat')
    .querySelector('.chatDropDownOptions').style.display = 'none';
};

// dropDownOptions features to chat after chat is loaded
let recentOpen = undefined;
let recentClickDropdown = undefined;
const dropdownOptions = (event) => {
  const closestChat = event.target
    .closest('.commonInBothChat')
    .querySelector('.dropdownOptions');

  if (recentOpen) {
    if (
      recentClickDropdown == event.target &&
      recentOpen.style.display == 'block'
    ) {
      recentOpen.style.display = 'none';
      recentOpen = recentClickDropdown = undefined;
      return;
    }
    recentOpen.style.display = 'none';
  }

  recentClickDropdown = event.target;
  if (closestChat.style.display == 'none') {
    closestChat.style.display = 'block';
    recentOpen = closestChat;
  } else {
    closestChat.style.display = 'none';
    recentOpen = recentClickDropdown = undefined;
  }
};
window.onclick = function (event) {
  if (recentOpen != undefined && event.target != recentClickDropdown) {
    recentOpen.style.display = 'none';
    recentOpen = recentClickDropdown = undefined;
  }
};

// delete selected chat
const deleteSelectedChat = async (event) => {
  const closestChat = event.target.closest('.commonInBothChat');
  const chatId = closestChat.getAttribute('chatId');
  try {
    const response = await axios({
      method: 'DELETE',
      url: '/v1/chitChat/',
      params: {
        chatId,
      },
    });
    if (response.status == 200) {
      closestChat.remove();
      socketLive.emit('requestToDeleteChatFromClient', {
        chatId,
        roomId,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

// socket.io
socketLive.on('recieveChatFromClientFriend', (data) => {
  if (data.forRoomId == roomId)
    appendChat(
      data.chatFromServer,
      'chatFromFriend',
      data.chatId,
      data.createdDate
    );
});
socketLive.on('recieveRequestToDeleteChatFromFriend', (data) => {
  if (roomId == data.roomId) {
    document.querySelector(`[chatId="${data.chatId}"]`).remove();
  }
});
socketLive.on('statusOnOffTyping', (data) => {
  if (roomId == data.roomId) {
    document.querySelector('.statusOnOffTyping').innerText =
      data.statusOnOffTyping;
  }
});

// chitChatFriendFilter
const allFriends = document.querySelectorAll('.friendDisplay');
document
  .getElementById('chitChatFriendFilter')
  .addEventListener('keyup', (event) => {
    let filterObj = document.getElementById('chitChatFriendFilter').value;
    filterObj = filterObj.toUpperCase();
    for (let i = 0; i < allFriends.length; i++) {
      const innerText = allFriends[i]
        .querySelector('.nameLeftStyle')
        .innerHTML.replace(/ /g, '');
      if (innerText.toUpperCase().indexOf(filterObj) > -1) {
        allFriends[i].style.display = '';
      } else {
        allFriends[i].style.display = 'none';
      }
    }
  });

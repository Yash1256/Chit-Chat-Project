const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { static } = require('express');
const taskSchedule = require('./utils/taskSchedule');
// const chitChat = require('./utils/chitChat');
const socketJs = require('socket.io');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });
const app = require(`${__dirname}/app.js`);

app.set('view engine', 'ejs');
app.set('view engine', 'pug');

const DB = process.env.DATABASE.replace('<password>', process.env.PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database Successfully Connected');
    taskSchedule();
  });

const port = process.env.PORT || 3000;
const socketServer = http.createServer(app);
const server = socketServer.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const io = require('socket.io')(socketServer);
const usersMapWithClientIdAndUserId = {};
const usersMapWithUserIdAndClientId = {};
io.on('connection', (client) => {
  console.log('connection established');
  client.on('joinRoom', (room) => {
    client.join(room.roomId);
    usersMapWithClientIdAndUserId[client.id] = {
      userId: room.userId,
      roomId: room.roomId,
    };
    usersMapWithUserIdAndClientId[room.userId] = client.id;
  });
  client.on('leaveRoom', (room) => {
    client.leave(room);
    const userId = usersMapWithClientIdAndUserId[client.id];
    const roomId =
      usersMapWithClientIdAndUserId[client.id] &&
      usersMapWithClientIdAndUserId[client.id].roomId;
    delete usersMapWithClientIdAndUserId[client.id];
    delete usersMapWithUserIdAndClientId[userId];
    client.to(roomId).emit('statusOnOffTyping', {
      roomId: roomId,
      statusOnOffTyping: '',
    });
  });
  client.on('disconnect', (data) => {
    const userId = usersMapWithClientIdAndUserId[client.id];
    const roomId =
      usersMapWithClientIdAndUserId[client.id] &&
      usersMapWithClientIdAndUserId[client.id].roomId;
    delete usersMapWithClientIdAndUserId[client.id];
    delete usersMapWithUserIdAndClientId[userId];
    client.to(roomId).emit('statusOnOffTyping', {
      roomId: roomId,
      statusOnOffTyping: '',
    });
  });
  client.on('statusOnOffTyping', (data) => {
    let statusOnOffTyping = data.statusOnOffTyping || '';
    if (!data.statusOnOffTyping && usersMapWithUserIdAndClientId[data.userId]) {
      statusOnOffTyping = 'Online';
      client.emit('statusOnOffTyping', {
        roomId: data.roomId,
        statusOnOffTyping,
      });
    }
    // console.log('hello,up', statusOnOffTyping, data);
    client.to(data.roomId).emit('statusOnOffTyping', {
      roomId: data.roomId,
      statusOnOffTyping,
    });
  });
  client.on('recieveChatFromClient', (data) => {
    client.to(data.roomId).emit('recieveChatFromClientFriend', {
      chatFromServer: data.chatFromYou,
      forRoomId: data.roomId,
      chatId: data.chatId,
      createdDate: data.createdDate,
    });
  });
  client.on('requestToDeleteChatFromClient', (data) => {
    client.to(data.roomId).emit('recieveRequestToDeleteChatFromFriend', data);
  });
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDELED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

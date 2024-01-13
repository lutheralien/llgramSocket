const { Server } = require("socket.io");
require("dotenv").config({ path: ".env" });

const io = new Server({ cors: "http://10.0.2.2:8081" });
const PORT = process.env.PORT
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  //listen to a connection
  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });
    console.log(onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);

    //add message
    socket.on("sendMessage", (message) => {
      console.log('message',message);
      const user = onlineUsers.find((user) => user.userId === message.recipientId);
      console.log('user',user);
      if (user) {
        console.log('works');
        io.to(user.socketId).emit("getMessage", message);
        io.to(user.socketId).emit("getNotification", {
          senderId: message.senderId,
          isRead: false,
          date: new Date(),
        })
      }
    });
    socket.on("disconnect", () => {
      console.log('disconnected');
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      console.log(onlineUsers);
      io.emit("getOnlineUsers", onlineUsers);
    });
  });
});
io.listen(PORT);

const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
const port = process.env.PORT || 3012;

const users = {}; // Changed to an object for better user management
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, it is working!"); 
});

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("New Connection");

  // Handle when a new user joins
  socket.on('joined', ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);

    // Send 'welcome' message to the joining client
    socket.emit('welcome', { user: "Admin", message: `Welcome to the chat, ${user}!` });

    // Broadcast 'userJoined' message to all clients (including the joining client)
    socket.emit('userJoined', { user: "Admin", message: `${user} has joined` });
  });

  socket.on('message', ({ message }) => {
    // Use socket.id to identify the sender in the broadcast
    io.emit('sendMessage', { user: users[socket.id], message, id: socket.id });
  });

  // Handle when a user disconnects
  socket.on('disconnect', () => {
    const user = users[socket.id]; // Get the username of the disconnected user
    console.log(`${user} has left`);
    delete users[socket.id]; // Remove user from the 'users' object
  });
});




server.listen(port, () => {
  console.log(`Server is working on port: http://localhost:${port}`);
});




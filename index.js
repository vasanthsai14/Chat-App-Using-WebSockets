const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {};

io.on("connection", (socket) => {
    socket.on("set-nickname", (nickname) => {
        users[socket.id] = nickname;
        io.emit("user-connected", nickname);
        io.emit("update-users", Object.values(users));
    });

    socket.on("disconnect", () => {
        const nickname = users[socket.id];
        if (nickname) {
            io.emit("user-disconnected", nickname);
            delete users[socket.id];
            io.emit("update-users", Object.values(users));
        }
    });

    socket.on("user-message", (data) => {
        users[socket.id] = data.nickname;
        if (data.recipient) {
            const recipientSocketId = Object.keys(users).find(key => users[key] === data.recipient);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("private-message", data);
            }
        } else {
            socket.broadcast.emit("message", data);
        }
    });

    socket.on("typing", (nickname) => {
        socket.broadcast.emit("typing", nickname);
    });

    socket.on("get-users", () => {
        socket.emit("update-users", Object.values(users));
    });
});

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
    return res.sendFile(path.resolve("./public/index.html"));
});

server.listen(9000, () => console.log(`Server Started at PORT:9000`));

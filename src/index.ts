import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST'],
    }
});


let connectedUsers: string[] = []

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data.room);
        socket.data.name = data.userName;
        socket.data.room = data.room;
        connectedUsers.push(data.userName);
        console.log(`User if ID: ${socket.id} joined room ${data.room}`);

        io.in(socket.data.room).emit('list-update', {
            list: connectedUsers
        });
    });

    socket.on("send_message", (data) => {
        socket.to(socket.data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
        connectedUsers = connectedUsers.filter(u => u != socket.data.name);

        io.in(socket.data.room).emit('list-update', {
            list: connectedUsers
        });
    });
});

server.listen(3001, () => { console.log("SERVER IS RUNNING.") });
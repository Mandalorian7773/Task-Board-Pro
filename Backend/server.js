const express = require('express');
const mongoose = require('./db/connection.js');
const projectRoutes = require('./Routes/project.router');
const taskRoutes = require('./Routes/task.router');
const cors = require('cors');
const userRouter = require("./Routes/user.router");
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { verifyToken } = require('./middleware/auth.middleware');

// Load environment variables
require('dotenv').config();

// Debug environment variables
console.log('Current working directory:', process.cwd());
console.log('.env file path:', path.resolve(process.cwd(), '.env'));
console.log('Environment variables loaded:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT ? 'Set' : 'Not set');
console.log('CLIENT_URL:', process.env.CLIENT_URL ? 'Set' : 'Not set');

console.log("MongoDB URI:", process.env.MONGO_URI);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join-project', (projectId) => {
        socket.join(projectId);
    });

    socket.on('task-update', (data) => {
        io.to(data.projectId).emit('task-updated', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Routes
app.use("/user", userRouter);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

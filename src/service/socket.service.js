const socketIO = require('socket.io');

class SocketService {
    constructor() {
        this.io = null;
        this.userSockets = new Map(); // 存储用户ID和socket连接的映射
    }

    // 初始化Socket服务
    initialize(server) {
        this.io = socketIO(server, {
            cors: {
                origin: '*', // 允许所有来源，方便测试
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                credentials: true,
                allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            },
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
            allowEIO3: true, // 允许 Socket.IO 3.x 客户端连接
            pingTimeout: 60000, // 增加超时时间
            pingInterval: 25000, // 增加心跳间隔
        });

        this.io.on('connection', socket => {
            console.log('New client connected:', socket.id);

            // 用户登录后，保存socket连接
            socket.on('user_connected', userId => {
                console.log('user_connected', userId);
                this.userSockets.set(userId, socket.id);
                console.log(
                    `User ${userId} connected with socket ${socket.id}`
                );
            });

            // 断开连接时，移除socket连接
            socket.on('disconnect', () => {
                for (const [userId, socketId] of this.userSockets.entries()) {
                    if (socketId === socket.id) {
                        this.userSockets.delete(userId);
                        console.log(`User ${userId} disconnected`);
                        break;
                    }
                }
            });

            // 添加错误处理
            socket.on('error', error => {
                console.error('Socket error:', error);
            });
        });

        // 添加全局错误处理
        this.io.on('error', error => {
            console.error('Socket.IO server error:', error);
        });
    }

    // 发送通知给特定用户
    sendNotification(userId, notification) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit('new_notification', notification);
            console.log(
                `Notification sent to user ${userId} with socket ${socketId}`
            );
        } else {
            console.log(`User ${userId} is not connected`);
        }
    }

    // 发送通知给多个用户
    sendNotificationToUsers(userIds, notification) {
        userIds.forEach(userId => {
            this.sendNotification(userId, notification);
        });
    }

    // 广播通知给所有在线用户
    broadcastNotification(notification) {
        this.io.emit('new_notification', notification);
    }
}

module.exports = new SocketService();

const { Server } = require("socket.io");
let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {                                                                                                                     
      cors: {
        origin: [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "https://taskstackhq.vercel.app",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
      },
    });
    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
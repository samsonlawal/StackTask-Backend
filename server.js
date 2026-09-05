require("dotenv").config();
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
// const socket = require("socket")

// Routes
const taskRoutes = require("./routes/v1/task.routes");
const userRoutes = require("./routes/v1/user.routes");
const memberRoutes = require("./routes/v1/member.routes");
const workspaceRoutes = require("./routes/v1/workspace.routes");
const authRoutes = require("./routes/v1/auth.routes");
const notificationRoutes = require("./routes/v1/notification.routes");
const sessionRoutes = require("./routes/v1/session.routes");
const activityRoutes = require("./routes/v1/activity.routes");

// const commentRoutes = require("./routes/v1/comment.routes");


const cors = require("cors");

const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", true);
const allowedOrigins = [
  "http://localhost:3000",
  "https://taskstackhq.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  }),
);

// Increase limits for JSON and Form Data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from Node API Server Updated");
});

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}]`,
    req.method,
    req.originalUrl,
    "from",
    req.headers.origin || "no-origin",
  );
  next();
});

// routes
app.use("/api/tasks", taskRoutes);

app.use("/api/workspaces", workspaceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workspaces", memberRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/activity", activityRoutes);
// app.use("/api/comments", commentRoutes);

app.use("/templates", express.static(path.join(process.cwd(), "templates")));


mongoose
  .connect(
    "mongodb+srv://admin:6QGyZECaKh4qWBha@stacktask-be-db.z3cs4.mongodb.net/Node-API?retryWrites=true&w=majority&appName=StackTask-BE-DB",
  )
  .then(() => {
    console.log("Connected to DB!");
  })
  .catch((error) => {
    console.log("DB Connection Failed!");
  });

// Monitor connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

const server = app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

const io = require('./socket').init(server)
io.on('connection', socket => {
  console.log('Client connected')
})


// 
// io.getIO().emit('posts', { actions: 'create', post: post })

// const socket = openSocket('server address')
// socket.on("posts", data => {
//   if(data.action === 'create') {
//     this.whatever(data.post)
//   }
// })
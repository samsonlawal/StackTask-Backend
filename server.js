require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const taskRoutes = require("./routes/v1/task.routes");
const userRoutes = require("./routes/v1/user.routes");
const memberRoutes = require("./routes/v1/member.routes");
const workspaceRoutes = require("./routes/v1/workspace.routes");
const productRoute = require("./routes/v1/product.routes");
const authRoutes = require("./routes/v1/auth.routes");
const cors = require("cors");

// console.log("Auth routes loaded:", authRoutes); // Add this line
// console.log("Auth routes type:", typeof authRoutes);

const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://taskstackhq.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true, // Important if you're sending cookies/auth headers
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello from Node API Server Updated");
});

// routes
app.use("/api/products", productRoute);
app.use("/api/tasks", cors(), taskRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workspaces", memberRoutes);
app.use("/api/auth", authRoutes);

// res.cookie("newUser", false);
// res.cookie("isEmployee", true, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
// res.send("you got the cookies");

// *********************************************************************

app.post("/api/users", (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

// app.use("/tasks", taskRoutes); // Connects tasks routes
// app.use("/workspaces", taskRoutes); // Connects tasks routes
// app.use("/users", taskRoutes); // Connects tasks routes

mongoose
  .connect(
    "mongodb+srv://admin:6QGyZECaKh4qWBha@stacktask-be-db.z3cs4.mongodb.net/Node-API?retryWrites=true&w=majority&appName=StackTask-BE-DB",
    // "mongodb+srv://admin:6QGyZECaKh4qWBha@stacktask-be-db.z3cs4.mongodb.net/?retryWrites=true&w=majority&appName=StackTask-BE-DB"
  )
  .then(() => {
    console.log("Connected to DB!");
  })
  .catch((error) => {
console.log("DB Connection Failed!");
console.log("Error message:", error.message);
console.log("Error code:", error.code);
    console.log("Full error:", error);
  });

  // Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

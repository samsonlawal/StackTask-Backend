const express = require("express");
const mongoose = require("mongoose");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
const memberRoutes = require("./routes/member.routes");
const workspaceRoutes = require("./routes/workspace.routes");
const productRoute = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const cors = require('cors')

const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors())

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

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
    "mongodb+srv://admin:PCocSTe0cBYdcWZJ@stacktask-be-db.z3cs4.mongodb.net/Node-API?retryWrites=true&w=majority&appName=StackTask-BE-DB"
  )
  .then(() => {
    console.log("Connected to DB!");
  })
  .catch(() => {
    console.log("Connected Failed!");
  });

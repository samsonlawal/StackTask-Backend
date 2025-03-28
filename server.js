const express = require("express");
const mongoose = require("mongoose");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
// const memberRoutes = require("./routes/memberRoutes");
const workspaceRoutes = require("./routes/workspace.routes");
const productRoute = require("./routes/product.routes");
const app = express();

app.use(express.json());

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

app.get("/", (req, res) => {
  res.send("Hello from Node API Server Updated");
});

// routes
app.use("/api/products", productRoute);
app.use("/api/tasks", taskRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/users", userRoutes);

// // get all products
// app.get("/api/products", async (req, res) => {
//   try {
//     const product = await Product.find({});
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // get a product
// app.get("/api/product/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findById(id);
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Create Product
// app.post("/api/products", async (req, res) => {
//   try {
//     const product = await Product.create(req.body);
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // update a product
// app.put("/api/products/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findByIdAndUpdate(id, req.body);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     const updatedProduct = await Product.findById(id);
//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // delete a product
// app.delete("/api/product/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findByIdAndDelete(id, req.body);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json({ message: "Product deleted successfully!" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

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

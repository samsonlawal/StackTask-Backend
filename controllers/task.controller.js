const Task = require("../models/task.model");
const { createNotification } = require("./notification.controller");

const mongoose = require("mongoose");

exports.createTask = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part

    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
    }

    const { workspace_id, assignee, createdBy } = req.body;

    console.log(createdBy);

    try {
      await createNotification({
        triggeredBy: new mongoose.Types.ObjectId(createdBy),
        userId: new mongoose.Types.ObjectId(assignee),
        workspaceId: new mongoose.Types.ObjectId(workspace_id),
        type: 1,
        title: req.body.title || req.body.description,
      });
      console.log(req.body.description);
    } catch (notifError) {
      console.error("Error creating notification:", notifError.message);
      return res.status(500).json({ error: "Notification creation failed" });
    }

    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  const { workspaceId } = req.params;

  try {
    const tasks = await Task.find({ workspace_id: workspaceId }).populate(
      "assignee",
      "name email profileImage fullname"
    );
    return res.status(200).json({ tasks, success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to get tasks", error: err });
  }
};

exports.getSingleTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Option 1: Use findById() - best for single documents
    const task = await Task.findById(id).populate(
      "assignee",
      "name email profileImage fullname"
    );

    // Option 2: Use findOne() - alternative to findById
    // const task = await Task.findOne({ _id: id });

    if (!task) {
      return res.status(404).json({
        success: true,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      task,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  console.log(req.body);

  try {
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part

    // const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
    }

    const { workspace_id, assignee, createdBy } = req.body;

    // console.log(createdBy);

    try {
      await createNotification({
        triggeredBy: new mongoose.Types.ObjectId(createdBy),
        userId: new mongoose.Types.ObjectId(assignee),
        workspaceId: new mongoose.Types.ObjectId(workspace_id),
        taskId: new mongoose.Types.ObjectId(id),
        type: 4,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError.message);
      return res.status(500).json({ error: "Notification creation failed" });
    }

    const task = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // console.log(task);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part

    // const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
    }


    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.promoteTask = async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part

    // const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
    }

    // find current task by ID
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Define ststus progression
    const statusFlow = {
      "to-do": "in-progress",
      "in-progress": "in-review",
      "in-review": "done",
      "done": "done", // No further progression from done
    }

    const currentStatus = task.status;
    const nextStatus = statusFlow[currentStatus];

    // check if promotion is possible
    if(currentStatus === "done") {
      return res.status(400).json({ error: "Task is already done", currentStatus });
    }

    // Update task status
    const updateTask = await Task.findByIdAndUpdate(
      id,
      {
        status: nextStatus,
        updated_at: new Date(), 
       },
      { new: true } 
    );

    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({task: updateTask, message: "Task promoted successfully", transition: { from: currentStatus, to: nextStatus } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.demoteTask = async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part

    // const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
    }

    // find current task by ID
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Define status progression
    const statusFlow = {
      "done": "in-review",
      "in-review": "in-progress",
      "in-progress": "to-do",
      "to-do": "to-do", // No further demotion from to-do
    }

    const currentStatus = task.status;
    const nextStatus = statusFlow[currentStatus];

    // check if demotion is possible
    if(currentStatus === "to-do") {
      return res.status(400).json({ error: "Task is already at the lowest status", currentStatus });
    }

    // Update task status
    const updateTask = await Task.findByIdAndUpdate(
      id,
      {
        status: nextStatus,
        updated_at: new Date(), 
       },
      { new: true } 
    );

    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({task: updateTask, message: "Task demoted successfully", transition: { from: currentStatus, to: nextStatus } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.done = async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part

    // const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { status: "done", updated_at: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ task, message: "Task marked as done successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};





// exports.getSingleTask = async (req, res) => {
//   const { taskID } = req.params;

//   try {
//     const task = await Task.find({ _id: taskID }).populate(
//       "assignee",
//       "name email profileImage fullname"
//     );
//     return res.status(200).json({ task, success: true });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getWorkspaceTasks = async (req, res) => {
//   try {
//     const { workspace_id, user_id } = req.query;
//     let query = {};

//     // Add filters based on provided parameters
//     if (workspace_id) {
//       query.workspace_id = workspace_id;
//     }

//     if (user_id) {
//       query["assignee"] = user_id;
//     }

//     const tasks = await Task.find(query).populate(
//       "assignee",
//       "name email profileImage fullname"
//     );

//     res.json(tasks);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };



// module.exports = {
// createTask, getTasks,
// }

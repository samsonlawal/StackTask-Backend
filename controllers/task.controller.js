const Task = require("../models/task.model");

exports.createTask = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part

    // const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
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
        success: false,
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




exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// module.exports = {
// createTask, getTasks,
// }

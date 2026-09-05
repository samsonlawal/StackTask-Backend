const Task = require("../models/task.model");
const Activity = require("../models/activity.model");
const { createNotification } = require("./notification.controller");
const { getTokenFromRequest } = require("../utils/helpers");

const mongoose = require("mongoose");

exports.createTask = async (req, res) => {
  try {

    const { workspace_id, assignee, createdBy } = req.body;
    const taskCount = await Task.countDocuments({ workspace_id });
    let attachments = []

    if(req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        url: file.path,
        name: file.originalname,
        size: file.size,
        fileType: file.mimetype,
      }))
    }
    
    const nextTaskNumber = String(taskCount + 1);

    // try {
    //   await createNotification({
    //     triggeredBy: new mongoose.Types.ObjectId(createdBy),
    //     userId: new mongoose.Types.ObjectId(assignee),
    //     workspaceId: new mongoose.Types.ObjectId(workspace_id),
    //     type: 1,
    //     title: req.body.title || req.body.description,
    //   });
    //   console.log(req.body.title);
    // } catch (notifError) {
    //   console.error("Error creating notification:", notifError.message);
    //   return res.status(500).json({ error: "Notification creation failed" });
    // }

    const task = new Task({
      ...req.body,
      attachments,
      task_number: nextTaskNumber
    });
    await task.save();

    await Activity.create({
      workspaceId: workspace_id,
      taskId: task._id,
      actor: createdBy || req.user?.id,
      type: "TASK_CREATED",
      actionText: `created this task`,
      // metadata: {
      //   newValue: task.title,
      // },

    })
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  const { workspaceId } = req.params;

  try {
    const tasks = await Task.find({ workspace_id: workspaceId })
      .populate("assignee", "name email profileImage fullname")
      .lean();
    return res.status(200).json({ tasks, success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get tasks", error: error.message });
  }
};

exports.getSingleTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Option 1: Use findById() - best for single documents
    const task = await Task.findById(id)
      .populate("assignee", "name email profileImage fullname")
      .lean();

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
  const actor = req.user.id;
  const { workspace_id, assignee, createdBy } = req.body;

  const updates = req.body;

  console.log(req.body);


  const oldTask = await Task.findById(id);
  if (!oldTask) return res.status(404).json({ message: "Task not found" });

  const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });

  // Log status change
  if (updates.status && updates.status !== oldTask.status) {
    await Activity.create({
      workspaceId: oldTask.workspace_id,
      taskId: id,
      actor,
      type: "STATUS_UPDATED",
      actionText: `changed status from ${oldTask.status} to ${updates.status}`,
      metadata: { oldValue: oldTask.status, newValue: updates.status },
    });
  }

  // Log assignee change
  if (updates.assignee && String(updates.assignee) !== String(oldTask.assignee)) {
    await Activity.create({
      workspaceId: oldTask.workspace_id,
      taskId: id,
      actor,
      type: "ASSIGNEE_UPDATED",
      actionText: `assigneed task to ${updates.assignee}`,
      metadata: { oldValue: oldTask.assignee, newValue: updates.assignee },
    });
  }

  if(updates.priority && updates.priority !== oldTask.priority) {
    await Activity.create({
      workspaceId: oldTask.workspace_id,
      taskId: id,
      actor,
      type: "PRIORITY_UPDATED",
      actionText: `set priority to ${updates.priority}`,
      metadata: { oldValue: oldTask.priority, newValue: updates.priority },
    });
  }

  if(updates.dueDate && updates.dueDate !== oldTask.dueDate) {
    await Activity.create({
      workspaceId: oldTask.workspace_id,
      taskId: id,
      actor,
      type: "DUE_DATE_UPDATED",
      actionText: `set due date to ${updates.dueDate}`,
      metadata: { oldValue: oldTask.dueDate, newValue: updates.dueDate },
    });
  }

  if(updates.description && updates.description !== oldTask.description) {
    await Activity.create({
      workspaceId: oldTask.workspace_id,
      taskId: id,
      actor,
      type: "DESCRIPTION_UPDATED",
      actionText: `updated description from to ${updates.description}`,
      metadata: { oldValue: oldTask.description, newValue: updates.description },
    });
  }

  if(updates.title && updates.title !== oldTask.title) {
    await Activity.create({
      workspaceId: oldTask.workspace_id,
      taskId: id,
      actor,
      type: "TITLE_UPDATED",
      actionText: `updated title to ${updates.title}`,
      metadata: { oldValue: oldTask.title, newValue: updates.title },
    });
  }



  try {
    let newAttachments = []

    if(req.files && req.files.length > 0) {

      await Activity.create({
      workspaceId: oldTask.workspace_id,
      taskId: id,
      actor,
      type: "ATTACHMENT_ADDED",
      actionText: `added ${req.files.length} files`,
      metadata: { oldValue: null, newValue: req.files.length },
    });

      newAttachments = req.files.map((file) => ({
        url: file.path,
        name: file.originalname,
        size: file.size,
        fileType: file.mimetype,
      }))
    }

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

    const updateData = req.body;

    const task = await Task.findByIdAndUpdate(id,
      newAttachments?.length > 0
      ? {...updateData, $push: {
      attachments: {$each: newAttachments}
    } }
    : updateData
 , {
      new: true,
    });

    console.log(task);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {


    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.promoteTask = async (req, res) => {
  const { id } = req.params;

  try {


    // find current task by ID
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Define ststus progression
    const statusFlow = {
      "to-do": "in-progress",
      "in-progress": "in-review",
      "in-review": "done",
      done: "done", // No further progression from done
    };

    const currentStatus = task.status;
    const nextStatus = statusFlow[currentStatus];

    // check if promotion is possible
    if (currentStatus === "done") {
      return res
        .status(400)
        .json({ error: "Task is already done", currentStatus });
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
    res.json({
      task: updateTask,
      message: "Task promoted successfully",
      transition: { from: currentStatus, to: nextStatus },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.demoteTask = async (req, res) => {
  const { id } = req.params;

  try {


    // find current task by ID
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Define status progression
    const statusFlow = {
      done: "in-review",
      "in-review": "in-progress",
      "in-progress": "to-do",
      "to-do": "to-do", // No further demotion from to-do
    };

    const currentStatus = task.status;
    const nextStatus = statusFlow[currentStatus];

    // check if demotion is possible
    if (currentStatus === "to-do") {
      return res
        .status(400)
        .json({ error: "Task is already at the lowest status", currentStatus });
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
    res.json({
      task: updateTask,
      message: "Task demoted successfully",
      transition: { from: currentStatus, to: nextStatus },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.done = async (req, res) => {
  const { id } = req.params;

  try {


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

const Notification = require("../models/notification.models");

// exports.createNotification = async (req, res) => {
//   try {
//     const { workspaceId, userId } = req.params;

//     const authHeader = req.headers.authorization;

//     if (!authHeader?.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Invalid or missing token" });
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//       return res.status(401).send({ error: "Please authenticate." });
//     }

//     const notificationData = {
//       ...req.body,
//       workspaceId: workspaceId,
//       userId: userId,
//     };

//     const notification = await Notification.create(notificationData);

//     // const notification = new Notification(req.body);
//     // await notification.save();
//     res
//       .status(201)
//       .json({ notification, message: "notification created succesfully" });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const createNotification = async ({
  workspaceId,
  userId,
  assigneeId,
  type,
  message,
}) => {
  return await Notification.create({
    workspaceId,
    userId,
    assigneeId,
    type,
    message,
  });
};

exports.getAllnotifications = async (req, res) => {
  // const { workspaceId } = req.params;

  try {
    const notifications = await Notification.find({});
    return res.status(200).json({ notifications, success: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get notifications", error: err });
  }
};

// module.exports = {
//   createNotification,
// };

// exports.getTasks = async (req, res) => {
//   const { workspaceId } = req.params;

//   try {
//     const tasks = await Task.find({ workspace_id: workspaceId }).populate(
//       "assignee",
//       "name email profileImage fullname"
//     );
//     return res.status(200).json({ tasks, success: true });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to get tasks", error: err });
//   }
// };

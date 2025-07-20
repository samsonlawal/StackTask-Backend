const Notification = require("../models/notification.models");

const generateMessage = ({ type, triggeredByName }) => {
  switch (type) {
    // Task related
    case 1:
      return `Ticket assigned to you: 'Update database`;
    case 2:
      return `[User] commented on ticket [Task Title]`;
    case 3:
      return `You were mentioned on'Navbar design'`;
    case 4:
      return `Task was updated`;
    case 5:
      return `'Write docs' is due tomorrow`;
    case 6:
      return `'Create landing page' is overdue`;

    // General
    case 100:
      return `Password change successful`;
    case 101:
      return `You updated your profile.`;

    // Workspace Related
    case 200:
      return `Workspace settings were changed by Sarah`;
    case 201:
      return `You are now an Admin in [Workspace Name].`;
    case 202:
      return `You've been removed from [Workspace Name]`;
    case 203:
      return `You've been invited to [Workspace Name] as a [Role]`;
    case 204:
      return `You are now an Admin in [Workspace Name].`;
    case 205:
      return `You're now a Member in [Workspace]`;
  }
};

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
  triggeredBy,
  type,
  message,
}) => {
  return await Notification.create({
    workspaceId,
    userId,
    triggeredBy,
    type,
    message,
  });
};

const getAllnotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({});
    return res.status(200).json({ notifications, success: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get notifications", error: err });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // userId?
    const notifications = await Notification.find({ userId: userId })
      .select("type isRead message createdAt")
      .populate("userId", "fullname")
      .populate("triggeredBy", "fullname")
      .populate("workspaceId", "name profileImage");

    const enriched = notifications.map((notif) => {
      const triggeredByName = notif.triggeredBy?.name || "";
      const message = generateMessage({
        type: notif.type,
        triggeredByName,
      });

      return {
        ...notif.toObject(),
        message,
      };
    });

    return res.status(200).json({ notifications: enriched, success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get user's notifications", error: err });
  }
};

const readNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.isRead) {
      return res
        .status(409)
        .json({ message: "Notification already marked as read" });
    }

    // Mark it as read and save
    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getAllnotifications,
  getUserNotifications,
  readNotification,
  readAllNotifications,
};

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

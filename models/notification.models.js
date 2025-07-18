const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    },
    type: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

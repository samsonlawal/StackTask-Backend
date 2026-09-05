const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
{
workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
    index: true,
},
taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
    index: true,
},
actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
},
type: {
    type: String,
    required: true,
    enum: [
    "TASK_CREATED",
    "STATUS_UPDATED",
    "PRIORITY_UPDATED",
    "ASSIGNEE_UPDATED",
    "DUE_DATE_UPDATED",
    "TITLE_UPDATED",
    "DESCRIPTION_UPDATED",
    "COMMENT_ADDED",
    "COMMENT_EDITED",
    "COMMENT_DELETED",
    "ATTACHMENT_ADDED",
    ],
},
actionText: {
    type: String,
    required: true,
},
metadata: {
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
},
},
{ timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);

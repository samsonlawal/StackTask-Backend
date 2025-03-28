const mongoose = require("mongoose");

const workspaceMemberSchema = new mongoose.Schema({
  workspace_id: { type: String, ref: "Workspace" }, // Workspace they belong to
  user_id: { type: String, ref: "User" }, // User who is a member
  role: { type: String, enum: ["owner", "admin", "member"], default: "member" }, // Role in the workspace
  joined_at: { type: Date, default: Date.now },
});

const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);

const mongoose = require("mongoose");

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    email: {
      type: String,
      required: true, // Store email to handle invitations
      // trim: true,
      unique: true,
      // lowercase: true,
    },

    role: {
      type: String,
      enum: ["Owner", "Admin", "Member"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "invited"],
      // default: "active",
    },

    jobTitle: {
      type: String,
      default: "",
    }, // Job title (Frontend Dev, Backend Dev, etc.)
  },
  { timestamps: true }
);

mongoose.set("strictPopulate", false);
const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);

module.exports = WorkspaceMember;

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
      trim: true,
      lowercase: true,
      // sparse: true, // allows multiple docs without email
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    role: {
      type: String,
      enum: ["Admin", "Member", "Owner"],
      default: "member",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "invited", "expired", "declined"],
      default: "active",
    },

    jobTitle: {
      type: String,
      default: "",
    },

    inviteToken: {
      type: String,
      // required: true,
    },

    inviteExpires: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

// Compound index: one entry per workspace+email or workspace+userId
workspaceMemberSchema.index(
  { workspaceId: 1, email: 1 }
  // { unique: true, sparse: true }
);

workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true, sparse: true }
);

mongoose.set("strictPopulate", false);
const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);

module.exports = WorkspaceMember;

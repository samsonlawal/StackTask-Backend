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
      enum: ["active", "invited", "expired", "declined", "suspended"],
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


workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true, sparse: true }
);
workspaceMemberSchema.index({ userId: 1, status: 1 });
workspaceMemberSchema.index({ workspaceId: 1, email: 1 });


mongoose.set("strictPopulate", false);
const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);

module.exports = WorkspaceMember;

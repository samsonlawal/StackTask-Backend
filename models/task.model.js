const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    // tags: [{ type: String, trim: true }], // Ensures clean string formatting
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["to-do", "in-progress", "in-review", "done"],
      default: "to-do",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspace_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    }, // Ensure every task is linked to a workspace
    // created_at: { type: Date, default: Date.now }, // Default timestamps
    // updated_at: { type: Date, default: Date.now },
    // completed_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);

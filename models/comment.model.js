const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    attachments: [
      {
        url: { type: String },
        fileName: { type: String },
        fileSize: { type: Number },
        fileType: { type: String },
      },
    ],
    // reactions: [
    //   {
    //     emoji: { type: String, required: true },
    //     users: [
    //       {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "User",
    //       },
    //     ],
    //   },
    // ],
    // How do we save emojis and return to the frontend and how does fronted display them (libraries??)
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient paginated comment lookups sorted by creation date
commentSchema.index({ taskId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
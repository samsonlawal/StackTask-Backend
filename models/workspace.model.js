const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  // _id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  // description: String,
  created_at: { type: Date, default: Date.now },
  owner: { type: String, ref: "User" }, // The user who created it
  // members: [
  //   {
  //     user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  //     role: String,
  //     joined_at: { type: Date, default: Date.now },
  //   },
  // ],
});

module.exports = mongoose.model("Workspace", workspaceSchema);

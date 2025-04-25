const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Workspace", workspaceSchema);



// WorkspaceSchema
// _id
// 67eabb06a1c0e6436a42b8e4
// workspaceId
// 67e6fa9f655480f4d614d6b6
// email
// "Pamilerin@gmail.com"
// role
// "Member"
// jobTitle
// "UI/UX Designer"
// createdAt
// 2025-03-31T15:55:50.614+00:00
// updatedAt
// 2025-03-31T15:55:50.614+00:00
// __v
// 0
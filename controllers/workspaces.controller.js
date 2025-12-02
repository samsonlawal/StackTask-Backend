const Workspace = require("../models/workspace.model");
const WorkspaceMember = require("../models/member.model");
const Task = require("../models/task.model");

const mongoose = require("mongoose");

const getWorkspaces = async (req, res) => {
  try {
    const workspace = await Workspace.find({});
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const memberDocs = await WorkspaceMember.find({ userId });
    const memberWorkspaceIds = memberDocs.map((doc) => doc.workspaceId);

    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { _id: { $in: memberWorkspaceIds } }],
    }).populate("owner", "name email profileImage"); // Populate owner with specific fields

    if (!workspaces || workspaces.length === 0) {
      return res.status(404).json({ message: "No workspaces found for user" });
    }

    const workspacesWithMemberCounts = await Promise.all(
      workspaces.map(async (ws) => {
        const memberCount = await WorkspaceMember.countDocuments({
          workspaceId: ws._id,
        });
        return {
          ...ws.toObject(),
          memberCount,
        };
      })
    );

    res.status(200).json(workspacesWithMemberCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findById(id).select("-__v");
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const memberCount = await WorkspaceMember.countDocuments({
      workspaceId: id,
    });

    res.status(200).json({
      ...workspace.toObject(),
      memberCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const createWorkspace = async (req, res) => {
//   // const { id } = req.params;

//   try {
//     const workspace = await Workspace.create(req.body);
//     res.status(200).json(workspace);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const createWorkspace = async (req, res) => {
  try {
    // Get user ID from URL params
    const { userId } = req.params;

    // Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Create workspace with name from body and owner from params
    const workspaceData = {
      ...req.body, // This should contain the workspace name
      owner: userId,
    };

    const workspace = await Workspace.create(workspaceData);

    // Automatically add the owner as a workspace member with "owner" role
    await WorkspaceMember.create({
      userId: userId,
      workspaceId: workspace._id,
      role: "owner", // or whatever role structure you're using
    });

    // Optionally populate the owner data in the response
    const populatedWorkspace = await Workspace.findById(workspace._id).populate(
      "owner",
      "name email"
    );

    res.status(201).json(populatedWorkspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findByIdAndUpdate(id);

    if (!workspace) {
      return res.status(404).json({ message: "workspace not found" });
    }
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const leaveWorkspace = async (req, res) => {
  try {
    const { userId, workspaceId } = req.params;
    const data = { userId, workspaceId };

    if (!userId || !workspaceId) {
      return res.status(400).json({ message: "missing userId or workspaceId" });
    }

    const deletedMember = await WorkspaceMember.findOneAndDelete(data);

    if (!deletedMember) {
      return res.status(400).json({ message: "Membership not found." });
    }

    return res.status(200).json({ message: "You have left the workspace." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const leaveWorkspace = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const workspace = await Workspace.findByIdAndDelete(id);

//     if (!workspace) {
//       return res.status(404).json({ message: "workspace not found" });
//     }
//     res.status(200).json({ message: "Workspace deleted successfully!" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findByIdAndDelete(id);

    if (!workspace) {
      return res.status(404).json({ message: "workspace not found" });
    }
    res.status(200).json({ message: "Workspace deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkspaces,
  getSingleWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getUserWorkspaces,
  leaveWorkspace,
};

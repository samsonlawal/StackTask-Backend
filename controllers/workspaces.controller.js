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
    });

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
  // Needs to fimd all data on the WS icluding users and merge to the response

  try {
    const { id } = req.params;
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "workspace not found" });
    }

    const tasks = await Task.find({ workspace_id: id }).populate("assignee");
    const members = await WorkspaceMember.find({ workspaceId: id }).populate(
      "userId"
    );

    res.status(200).json({ workspace, tasks, members });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.create(req.body);
    res.status(200).json(workspace);
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
};

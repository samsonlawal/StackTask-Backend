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

    // find user's workspaces
    const memberships = await WorkspaceMember.find({
      userId,
      status: ["active"],
    });
    // console.log(memberships);
    const memberWorkspaceIds = memberships.map((doc) => doc.workspaceId);

    // Owner's data
    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { _id: { $in: memberWorkspaceIds } }],
    }).populate("owner", "name email profileImage"); // Populate owner with specific fields

    if (!workspaces || workspaces.length === 0) {
      // for me: we can also return 200 with an empty array here
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

const getPendingInvites = async (req, res) => {
  try {
    let { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    userId = new mongoose.Types.ObjectId(userId);

    const invites = await WorkspaceMember.find({
      userId,
      status: "invited",
    }).populate("workspaceId", "name owner");

    const data = invites.map((invite) => ({
      email: invite.email,
      workspaceId: invite.workspaceId._id,
      workspaceName: invite.workspaceId.name,
      role: invite.role,
      inviteExpires: invite.inviteExpires,
      inviteToken: invite.inviteToken,
      // ownerId: invite.workspaceId.owner?._id,
      // invitedAsEmail: invite.email ? true : false,
      // inviteId: invite._id,
    }));

    res.status(200).json({
      data,
      message: "Invites fetched successfully",
    });
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
      role: "Owner", // or whatever role structure you're using
    });

    // Optionally populate the owner data in the response
    const populatedWorkspace = await Workspace.findById(workspace._id).populate(
      "Owner",
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

// Accepting Invites
const acceptInvite = async (req, res) => {
  try {
    const { id, email } = req.user;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Invite token is required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const invite = await WorkspaceMember.findOne({
      // userId,
      inviteToken: hashedToken,
      status: "invited",
      inviteExpires: { $gt: Date.now() },
    });

    if (!invite) {
      return res.status(401).json({
        message: "Invite is invalid or has expired",
      });
    }

    if (invite.email !== email) {
      return re.status(401).json({
        message: "Invite doesn't belong to you",
      });
    }

    invite.status = "active";
    invite.userId = id;
    invite.inviteExpires = undefined;
    invite.inviteToken = undefined;

    await invite.save();

    const acceptInvite = await invite;

    return res.status(200).json({
      message: "Invite accpeted successfully",
      // invites,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
};

module.exports = {
  getWorkspaces,
  getSingleWorkspace,
  getPendingInvites,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getUserWorkspaces,
  leaveWorkspace,
  acceptInvite,
};

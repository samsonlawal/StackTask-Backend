const WorkspaceMember = require("../models/member.model");
const User = require("../models/user.model");

const getMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Fetch all members for this workspace
    const members = await WorkspaceMember.find({ workspaceId }).populate(
      "userId",
      "name email"
    );

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleMember = async (req, res) => {
  try {
    const { _id } = req.query;
    const member = await WorkspaceMember.findById({ _id });

    if (!member) {
      return res.status(404).json({ message: "member not found" });
    }

    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const AddMember = async (req, res) => {
//   try {
//     const { workspaceId, userId, role } = req.body;

//     // Check if workspace exists
//     const workspace = await WorkspaceMember.findById(workspaceId);
//     if (!workspace) {
//       return res.status(404).json({ message: "Workspace not found" });
//     }

//     // Check if user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if user is already a member
//     const existingMember = await Member.findOne({ workspaceId, userId });
//     if (existingMember) {
//       return res.status(400).json({ message: "User is already a member" });
//     }

//     // Create new member
//     const member = await WorkspaceMember.create({
//       workspaceId,
//       userId,
//       role: role || "member",
//     });

//     res.status(201).json(member);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const AddMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    let { email, role, jobTitle, status } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      userId = user._id;
      status = "invited"; // User exists, so they are active
    }

    // Check if the user is already a member
    const existingMember = await WorkspaceMember.findOne({
      workspaceId,
      email,
    });
    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this workspace" });
    }

    const member = await WorkspaceMember.create({
      workspaceId,
      email, // Store the actual user ID internally
      role,
      jobTitle,
      status,
    });

    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    const member = await WorkspaceMember.findOneAndUpdate(
      { _id: memberId, workspaceId },
      { role },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const deletedMember = await WorkspaceMember.findOneAndDelete({
      _id: memberId,
      workspaceId,
    });

    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMembers,
  getSingleMember,
  AddMember,
  removeMember,
  updateMemberRole,
};

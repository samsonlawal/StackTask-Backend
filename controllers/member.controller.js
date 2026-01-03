const WorkspaceMember = require("../models/member.model");
const User = require("../models/user.model");

const crypto = require("crypto");

const fs = require("fs");
const path = require("path");

function loadTemplate(filename) {
  const filePath = path.join(__dirname, "../templates/Email", filename);
  return fs.readFileSync(filePath, "utf-8");
}

const { transporter } = require("../services/email");

const getMembers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Fetch all members for this workspace
    const members = await WorkspaceMember.find({ workspaceId }).populate(
      "userId",
      "name email profileImage fullname"
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

const AddMember = async (req, res) => {
  const { workspaceId } = req.params;
  let { email, role, jobTitle, workspaceName } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Check if this member already exists
    // const query = user
    //   ? {
    //       workspaceId,
    //       userId: user._id || null,
    //       email,
    //       satus: { $in: ["invited", "active"] },
    //     }
    //   : { workspaceId, email };

    const existingMember = await WorkspaceMember.findOne({
      workspaceId,
      email,
      status: { $in: ["invited", "active"] },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this workspace" });
    }

    // toeknization
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const inviteExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Create member object based on whether user exists
    const memberData = {
      workspaceId,
      email,
      // userId: user._id || null,
      role,
      status: "invited",
      jobTitle: jobTitle || "",
      inviteToken: hashedToken,
      inviteExpires,
    };

    // For existing users, use userId and don't store email
    if (user) {
      // memberData.email = email;
      memberData.userId = user._id;
      // memberData.status = "invited";
    }
    // For invited users (not yet registered), store email and null userId
    else {
      // memberData.email = email;
      memberData.userId = null;
      // memberData.status = "invited";
    }

    const member = await WorkspaceMember.create(memberData);

    // const inviteLink = `https://taskstackhq.vercel.app/invite/accept?token=${token}`;

    let html = loadTemplate("invitation.html");

    html = html.replace("{{email}}", email);
    html = html.replace("{{workspaceName}}", workspaceName);
    // html = html.replace("{{inviteLink}}", inviteLink);

    await transporter
      .sendMail({
        to: email,
        from: "TaskStackHQ <taskstackhq@gmail.com>",
        subject: "Invitation to a workspace on Taskstackhq!",
        html,
        replyTo: "taskstackhq@gmail.com",
      })
      .then(() => console.log("Invitation Email Sent"))
      .catch((err) => console.error("Invite email failed:", err.message));

    res.status(200).json({
      message: "Inivitation Sent",
      member: member,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const AcceptInvite = async (req, res) => {
  try {
    // const {token}
  } catch (err) {
    return res.satus(500).json({
      message: err.message,
    });
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

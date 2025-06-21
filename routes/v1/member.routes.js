const express = require("express");
const router = express.Router();
const {
  AddMember,
  getMembers,
  updateMemberRole,
  removeMember,
  getSingleMember,
} = require("../../controllers/member.controller");

router.post("/:workspaceId/members", AddMember);
router.get("/:workspaceId/members", getMembers);
router.get("/:workspaceId/members/:memberId", getSingleMember);
router.patch("/:workspaceId/members/:memberId", updateMemberRole);
router.delete("/:workspaceId/members/:memberId", removeMember);

module.exports = router;

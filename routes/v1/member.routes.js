const express = require("express");
const router = express.Router();
const {
  AddMember,
  getMembers,
  updateMemberRole,
  removeMember,
  getSingleMember,
  suspendMember,
} = require("../../controllers/member.controller");

router.post("/:workspaceId/members", AddMember);
router.get("/:workspaceId/members", getMembers);
router.get("/:workspaceId/members/:memberId", getSingleMember);
router.patch("/:workspaceId/members/edit-role/:memberId", updateMemberRole);
router.put("/:workspaceId/members/suspend/:memberId", suspendMember);
router.delete("/:workspaceId/members/remove/:memberId", removeMember);

module.exports = router;

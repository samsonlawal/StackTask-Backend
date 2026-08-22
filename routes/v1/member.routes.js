const express = require("express");
const router = express.Router();
const requireAuth = require("../../middleware/authMiddleware");
const {
  AddMember,
  getMembers,
  updateMemberRole,
  removeMember,
  getSingleMember,
  suspendMember,
} = require("../../controllers/member.controller");

router.post("/:workspaceId/members", requireAuth, AddMember);
router.get("/:workspaceId/members", requireAuth, getMembers);
router.get("/:workspaceId/members/:memberId", requireAuth, getSingleMember);
router.patch("/:workspaceId/members/edit-role/:memberId", requireAuth, updateMemberRole);
router.put("/:workspaceId/members/suspend/:memberId", requireAuth, suspendMember);
router.delete("/:workspaceId/members/remove/:memberId", requireAuth, removeMember);

module.exports = router;

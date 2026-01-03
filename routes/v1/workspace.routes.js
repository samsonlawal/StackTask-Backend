const express = require("express");
const router = express.Router();
const requireAuth = require("../../middleware/authMiddleware");
const {
  getWorkspaces,
  createWorkspace,
  getSingleWorkspace,
  deleteWorkspace,
  updateWorkspace,
  getUserWorkspaces,
  leaveWorkspace,
  getPendingInvites,
  acceptInvite,
} = require("../../controllers/workspaces.controller");

router.get("/", getWorkspaces);
router.get("/user/:userId", getUserWorkspaces);
router.get("/invites/:userId", requireAuth, getPendingInvites);
router.get("/invite/accept/", requireAuth, acceptInvite);
router.get("/:id", getSingleWorkspace);
router.post("/:userId", createWorkspace);
router.delete("/:id", deleteWorkspace);
router.put("/:id", updateWorkspace);
router.post("/:userId", leaveWorkspace);

module.exports = router;

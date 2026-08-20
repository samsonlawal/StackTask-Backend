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
  getWorkspaceBySlug,
} = require("../../controllers/workspaces.controller");

router.get("/", getWorkspaces);
router.get("/user/:userId", getUserWorkspaces);
router.get("/invites/:userId", getPendingInvites);
router.post("/invite/accept/:membershipId", requireAuth, acceptInvite);
router.get("/:id", getSingleWorkspace);
router.post("/:userId", createWorkspace);
router.delete("/:id", requireAuth, deleteWorkspace);
router.put("/:id", updateWorkspace);
router.post("/:userId", leaveWorkspace);
router.get("/slug/:slug", getWorkspaceBySlug);

module.exports = router;

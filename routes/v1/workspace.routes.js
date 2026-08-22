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
router.get("/user/:userId", requireAuth, getUserWorkspaces);
router.get("/invites/:userId", requireAuth, getPendingInvites);
router.post("/invite/accept/:membershipId", requireAuth, acceptInvite);
router.get("/:id", requireAuth, getSingleWorkspace);
router.post("/:userId", requireAuth, createWorkspace);
router.delete("/:id", requireAuth, deleteWorkspace);
router.put("/:id", requireAuth, updateWorkspace);
router.post("/leave/:userId", requireAuth, leaveWorkspace);
router.get("/slug/:slug", requireAuth, getWorkspaceBySlug);

module.exports = router;

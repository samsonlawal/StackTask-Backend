const express = require("express");
const router = express.Router();
const {
  getWorkspaces,
  createWorkspace,
  getSingleWorkspace,
  deleteWorkspace,
  updateWorkspace,
  getUserWorkspaces,
  leaveWorkspace,
} = require("../../controllers/workspaces.controller");

router.get("/", getWorkspaces);
router.get("/user/:userId", getUserWorkspaces);
router.get("/:id", getSingleWorkspace);
router.post("/:userId", createWorkspace);
router.delete("/:id", deleteWorkspace);
router.put("/:id", updateWorkspace);
router.post("/:userId", leaveWorkspace);


module.exports = router;

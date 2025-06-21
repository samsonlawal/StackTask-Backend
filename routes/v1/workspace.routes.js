const express = require("express");
const router = express.Router();
const {
  getWorkspaces,
  createWorkspace,
  getSingleWorkspace,
  deleteWorkspace,
  updateWorkspace,
  getUserWorkspaces,
} = require("../../controllers/workspaces.controller");

router.get("/", getWorkspaces);
router.get("/user/:userId", getUserWorkspaces);
router.get("/:id", getSingleWorkspace);
router.post("/", createWorkspace);
router.delete("/:id", deleteWorkspace);
router.put("/:id", updateWorkspace);

module.exports = router;

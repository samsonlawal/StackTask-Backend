const express = require("express");
const router = express.Router();
const requireAuth = require("../../middleware/authMiddleware");
const { createLabel, getLabels } = require("../../controllers/label.controller");

router.get("/:workspaceId/labels", requireAuth, getLabels);
router.post("/:workspaceId/labels", requireAuth, createLabel);

module.exports = router;
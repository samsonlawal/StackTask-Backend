const express = require("express");
const router = express.Router();
const {
  getTaskActivities
} = require("../../controllers/activity.controller");
const requireAuth = require("../../middleware/authMiddleware");

router.get("/:taskId", requireAuth, getTaskActivities);


module.exports = router;

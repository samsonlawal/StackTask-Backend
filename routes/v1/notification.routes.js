const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotifications,
} = require("../../controllers/notification.controller");

router.post("/:workspaceId/:userId", createNotification);
// router.get("/:workspaceId", getNotifications);

module.exports = router;

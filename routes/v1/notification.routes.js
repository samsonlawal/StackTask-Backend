const express = require("express");
const router = express.Router();
const {
  getAllnotifications,
  getUserNotifications,
  readNotification,
  readAllNotifications,
} = require("../../controllers/notification.controller");

router.get("/", getAllnotifications);
router.get("/:userId", getUserNotifications);
router.patch("/read/:id", readNotification);
router.patch("/read-all/:userId", readAllNotifications);




module.exports = router;

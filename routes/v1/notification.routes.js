const express = require("express");
const router = express.Router();
const {
  getAllnotifications,
} = require("../../controllers/notification.controller");

router.get("/", getAllnotifications);

module.exports = router;

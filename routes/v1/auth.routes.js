const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  activateUser,
} = require("../../controllers/user.controller");

router.post("/register", signup);
router.post("/login", login);
routes.post("/activate-account", activateUser);

module.exports = router;

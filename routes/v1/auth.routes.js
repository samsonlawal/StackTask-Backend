const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  activateUser,
  forgotPassword,
  resetPassword,
} = require("../../controllers/user.controller");

router.post("/register", signup);
router.post("/login", login);
router.get("/activate-account", activateUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;

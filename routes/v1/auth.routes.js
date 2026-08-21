const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  activateUser,
  forgotPassword,
  resetPassword,
  logout
} = require("../../controllers/user.controller");
const requireAuth = require("../../middleware/authMiddleware");

router.post("/register", signup);
router.post("/login", login);
router.get("/activate-account", activateUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", requireAuth, logout);

module.exports = router;

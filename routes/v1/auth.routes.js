const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  activateUser,
} = require("../../controllers/user.controller");

router.post("/register", signup);
router.post("/login", login);
router.get("/activate-account", activateUser);

console.log("AUTH ROUTES FILE LOADED");

module.exports = router;

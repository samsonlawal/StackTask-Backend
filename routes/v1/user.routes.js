const express = require("express");
const {
  getSingleUser,
  getUsers,
  deleteUser,
  updateUser,
  getProfile,
} = require("../../controllers/user.controller");
const { upload } = require("../../utils/upload");
const requireAuth = require("../../middleware/authMiddleware");
const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getSingleUser);
router.delete("/:id", requireAuth, deleteUser);
router.put(
  "/update-avatar",
  requireAuth,
  upload.single("profileImage"),
  updateUser
);
router.get("/profile/:id", requireAuth, getProfile);
module.exports = router;

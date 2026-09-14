const express = require("express");
const router = express.Router();
const requireAuth = require("../../middleware/authMiddleware");
const {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
  toggleReaction,
} = require("../../controllers/comment.controller");

// All comment routes require authentication
router.use(requireAuth);

router.post("/tasks/:taskId", createComment);
router.get("/tasks/:taskId", getTaskComments);
router.patch("/:id", updateComment);
router.delete("/:id", deleteComment);
router.post("/:id/reactions", toggleReaction);

module.exports = router;

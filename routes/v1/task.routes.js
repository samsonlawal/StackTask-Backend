const express = require("express");
const router = express.Router();
const requireAuth = require("../../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  promoteTask,
  demoteTask,
  done,
} = require("../../controllers/task.controller");
const { uploadTaskAttachment } = require("../../utils/upload");
const {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
  toggleReaction,
} = require("../../controllers/comment.controller");



router.get("/:workspaceId", requireAuth, getTasks);
router.post("/", requireAuth, uploadTaskAttachment.array("attachments", 10), createTask);
// router.get("/", getWorksapceTasks);
router.get("/single/:id", requireAuth, getSingleTask);
router.patch("/:id", requireAuth, uploadTaskAttachment.array("attachments", 10), updateTask);
router.delete("/:id", requireAuth, deleteTask);
router.patch("/promote/:id", requireAuth, promoteTask);
router.patch("/demote/:id", requireAuth, demoteTask);
router.patch("/done/:id", requireAuth, done);

// All comment routes require authentication
router.post("/comment", requireAuth, createComment);
router.get("/:taskId/comment", requireAuth, getTaskComments);
router.patch("/comment/:commentId", requireAuth, updateComment);
router.delete("/comment/:commentId", requireAuth, deleteComment);
router.post("/comment/:commentId/reactions", requireAuth, toggleReaction);


module.exports = router;

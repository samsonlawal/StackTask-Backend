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

// router.use(requireAuth);

router.get("/:workspaceId", requireAuth, getTasks);
router.post("/", requireAuth, createTask);
// router.get("/", getWorksapceTasks);
router.get("/single/:id", requireAuth, getSingleTask);
router.patch("/:id", requireAuth, updateTask);
router.delete("/:id", requireAuth, deleteTask);
router.patch("/promote/:id", requireAuth, promoteTask);
router.patch("/demote/:id", requireAuth, demoteTask);
router.patch("/done/:id", requireAuth, done);


module.exports = router;

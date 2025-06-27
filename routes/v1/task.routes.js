const express = require("express");
const router = express.Router();
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

router.get("/:workspaceId", getTasks);
router.post("/", createTask);
// router.get("/", getWorksapceTasks);
router.get("/single/:id", getSingleTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/promote/:id", promoteTask);
router.patch("/demote/:id", demoteTask);
router.patch("/done/:id", done);


module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getSingleUser,
  createUser,
  getUsers,
  deleteUser,
  updateUser,
} = require("../controllers/user.controller");

router.get("/", getUsers);
router.get("/:id", getSingleUser);
router.post("/", createUser);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

module.exports = router;

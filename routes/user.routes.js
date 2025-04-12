const express = require("express");
const {
  getSingleUser,
  getUsers,
  deleteUser,
  updateUser,
} = require("../controllers/user.controller");
const { upload } = require("../utils/upload");
const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getSingleUser);
router.delete("/:id", deleteUser);
router.put("/:id", upload.single("profileImage"), updateUser);

module.exports = router;

const express = require("express");
const router = express.Router();
const requireAuth = require("../../middleware/authMiddleware");
const { getSessions, deleteSession } = require("../../controllers/session.controller");


router.get("/", requireAuth, getSessions);
router.delete("/:id", requireAuth, deleteSession);


module.exports = router;
const express = require("express");
const Task = require("../models/users.model"); // Import Mongoose model
const router = express.Router();

// Create a new user (like inserting into Supabase)
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body); // Create user from request body
    await user.save(); // Save to MongoDB
    res.status(201).json(user); // Return the created user
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

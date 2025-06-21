const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/upload");
const multer = require("multer");

// Multer setup for parsing multipart/form-data (no disk storage needed)
const storage = multer.memoryStorage();
const upload = multer({ storage });

//handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = {};

  // login errors
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate error code
  if (err.code === 11000) {
    if (err.keyValue.email) {
      errors.email = "That email is already registered";
    } else if (err.keyValue.username) {
      errors.username = "That username is already registered";
    }

    return errors;
  }

  // validation error
  if (err.message.includes("User validation failed")) {
    errors = { fullname: "", email: "", password: "", username: "" };
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
    return errors;
  }

  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = ({ id }) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

const getUsers = async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part

    // const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
    }

    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sign Up
const signup = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({
      message: "Signup successful. Please login to continue.",
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json(errors);
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    const formatUser = (user) => ({
      _id: user._id,
      username: user.username,
      email: user.email,
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });

    res.status(200).json({
      user: formatUser(user),
      token,
      succes: true,
      message: "Login Successful",
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({
      errors,
      success: false,
    });
  }
};

// Update user controller
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    let imageUrl;

    if (req.file) {
      imageUrl = req.file.path;
    }

    // Create the update object, adding image if available
    const updatedFields = {
      ...req.body,
      ...(imageUrl && { profileImage: imageUrl }),
    };

    const updatedUser = await User.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ message: "user deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  signup,
  login,
};

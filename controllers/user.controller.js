const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
// const cloudinary = require("../utils/upload");
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
  return jwt.sign({ id }, "samdejs secret", {
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
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: formatUser(user), token });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

// Update user controller
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // If image was uploaded, Multer + Cloudinary handled it, and we get the URL here:
    const imageUrl = req.file ? req.file.path : undefined;

    // Apply Cloudinary transformation to make the image square
    const squareImageUrl = imageUrl
      ? cloudinary.url(req.file.public_id, {
          width: 200, // Set the width of the square
          height: 200, // Set the height of the square (same as width)
          crop: "fill", // This ensures the image is cropped to a square
          gravity: "center", // This makes sure the center of the image is retained
        })
      : undefined;

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

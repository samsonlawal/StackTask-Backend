const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { getTokenFromRequest } = require("../utils/helpers");
const cloudinary = require("../utils/upload");
const multer = require("multer");
const crypto = require("crypto");
const UAParser = require("ua-parser-js");
const Session = require("../models/session.model");
const geoip = require("geoip-lite");

const fs = require("fs");
const path = require("path");

function loadTemplate(filename) {
  const filePath = path.join(__dirname, "../templates/Email", filename);
  return fs.readFileSync(filePath, "utf-8");
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

const { transporter } = require("../services/email");

//handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = {};

  // login errors
  // errors.message = "Invalid email or password";

  // duplicate error code
  if (err.code === 11000) {
    if (err.keyValue.email) errors.message = "That email is already registered";
    else if (err.keyValue.username)
      errors.message = "That username is already registered";
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

  errors.general = err.message || "An unknown error occurred";
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = ({ id, email, sessionId }) => {
  return jwt.sign({ id, email, sessionId }, process.env.JWT_SECRET, {
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
    const token = getTokenFromRequest(req);

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

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this profile" });
    }
    const user = await User.findById(id).select(
      "_id fullname username email profileImage"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// Sign Up
const signup = async (req, res) => {
  try {
    let activationLink;
    // const token = createToken(user._id);
    const activationToken = crypto.randomBytes(32).toString("hex");
    const hashedActivationToken = crypto
      .createHash("sha256")
      .update(activationToken)
      .digest("hex");
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    const user = await User.create({
      ...req.body,
      hashedToken: hashedActivationToken,
      tokenExpires,
    });

    activationLink = `http://taskstackhq.vercel.app/auth/activate-account?token=${activationToken}`;

    let html = loadTemplate("otp.html");

    html = html.replace("{{username}}", user.username);
    html = html.replace("{{email}}", user.email);

    html = html.replace("{{link}}", activationLink);

    await transporter
      .sendMail({
        to: user.email,
        from: "TaskStackHQ <taskstackhq@gmail.com>",
        subject: "Signup to taskstackhq successsful!",
        html,
        replyTo: "taskstackhq@gmail.com",
      })
      .then(() => console.log("Email sent"))
      .catch((err) => console.error(err));

    res.status(201).json({
      message:
        "Signup successful. Please check your email for activation link.",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);

    // Handle known errors
    const errors = handleErrors(error);

    // If duplicate email/username or validation, respond 400
    if (
      error.code === 11000 ||
      error.message.includes("User validation failed")
    ) {
      return res.status(400).json(errors);
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        general: "Service temporarily unavailable. Try again.",
      });
    }

    // For DB/network errors (like ETIMEDOUT), respond 500
    res.status(500).json({ general: error.message || "Internal server error" });
  }
};

// Activating User
const activateUser = async (req, res) => {
  try {
    const { token } = req.query;
    console.log(token);

    if (!token) {
      return res.status(400).json({ message: "Missing activation token" });
    }

    const newHashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      hashedToken: newHashedToken,
      tokenExpires: { $gt: Date.now() },
    });

    console.log(user);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid or expired activation token" });
    }

    if (user.isVerified) {
      return res.status(409).json({
        message: "Account already activated.",
      });
    }

    user.isVerified = true;
    user.hashedToken = undefined;
    user.tokenExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User activated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Activation failed. Please try again.",
    });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    const parser = new UAParser(req.headers["user-agent"]);
    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";
    const deviceInfo = `${browser} on ${os}`;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const sessionDurationMs = 14 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + sessionDurationMs);

        const geo = geoip.lookup(ipAddress);
    let location = "Unknown Location";
    
    if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
       location = "Localhost";
    } else if (geo) {
       location = `${geo.region || "Unknown Region"}, ${geo.country || "Unknown Country"}`;
    }

    const newSession = await Session.create({
      userId: user._id,
      ipAddress: ipAddress,
      location: location,
      deviceInfo: deviceInfo,
      expiresAt: expiresAt,
    });

    console.log(newSession);

    const token = createToken({
      id: user._id,
      email: user.email,
      sessionId: newSession._id,
    });

    const formatUser = (user) => ({
      _id: user._id,
      username: user.username,
      email: user.email,
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: maxAge * 1000,
    });

    res.status(200).json({
      user: formatUser(user),
      token,
      succes: true,
      message: "Login Successful",
    });
  } catch (err) {
    if (err.message === "Account not activated") {
      return res.status(403).json({
        message: "Please activate your account. Check your email for link.",
        success: false,
      });
    }

    res.status(401).json({
      message: "Invalid email or password",
      success: false,
    });
  }
};

// Update user controller
const updateUser = async (req, res) => {
  const userId = req.user.id;

  let imageUrl;
  console.log(req.file);

  if (req.file) {
    imageUrl = req.file.path;
  }

  console.log(imageUrl);

  try {
    // Create the update object, adding image if available
    const updatedFields = {
      ...req.body,
      ...(imageUrl && { profileImage: imageUrl }),
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
      select: "-password",
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Avatar updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const UpdateUserDetails = async (req, res) => {
  const id = req.user.id;

  try {
    const updatedFields = {
      ...req.body,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
      select: "-password",
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Avatar updated successfully",
    });
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


const forgotPassword = async (req, res) => {

  const { email } = req.body;

  try { 

    if(!email){
      return res.status(400).json({
        message: "Please provide your email"
      })
    }

    const user = await User.findOne({ email });

      if(!user) {
        return res.status(200).json({
          success: true,
          message: "If an account associated with this email exists, we've sent a password reset link.",
        })
      }

      // Create Token
       const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

       // Hash code with SHA-256 before saving to DB
    const hashedCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");
      
      user.hashedToken = hashedCode;
      user.tokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      await user.save();

      // Send email with reset code
      let html = loadTemplate("password-reset2.html");
      html = html.replace("{{username}}", user.username);
      html = html.replace("{{email}}", user.email);
      html = html.replace("{{code}}", resetCode);

 
   await transporter
      .sendMail({
        to: user.email,
        from: "TaskStackHQ <taskstackhq@gmail.com>",
        subject: "TaskStackHQ Password Reset Code",
        html,
        replyTo: "taskstackhq@gmail.com",
      })

      res.status(200).json({
        success: true,
        message: "Password reset code sent successfully",
      })

      console.log("Email sent to", user.email)
    
   } catch(error) {
    res.status(500).json({
      message: "Error processing request. Please try again.",
    })
    console.log(error)
   } 
}


const resetPassword = async (req, res) => {
  const {email, password, code} = req.body;

 try{
   if(!email || !password || !code) {
    return res.status(400).json({
      message: "Email, reset code, and new password are required."
    })
  }

  // Hash the submitted code with SHA-256
  const hashedCode = crypto
  .createHash("sha256")
  .update(code)
  .digest("hex");

    const user = await User.findOne({
      email,
      hashedToken: hashedCode,
      tokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset code.",
      });
    }

    user.password = password;
    user.hashedToken = undefined;
    user.tokenExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful. You can now login.",
    })

 } catch(error) {
    console.log("resetPassword error:", error);
    res.status(500).json({
      message: "Password reset failed. Please try again.",
    });
 }
}

// Logout
const logout = async (req, res) => {
  try {
    if (req.user && req.user.sessionId) {
      await Session.findByIdAndDelete(req.user.sessionId);
    }

   
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1, 
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  signup,
  login,
  activateUser,
  getProfile,
  UpdateUserDetails,
  forgotPassword,
  resetPassword,
  logout
};

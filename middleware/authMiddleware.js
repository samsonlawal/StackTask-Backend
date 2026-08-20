const jwt = require("jsonwebtoken");
const Session = require("../models/session.model");
const { getTokenFromRequest } = require("../utils/helpers");

const requireAuth = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await Session.findById(decoded.sessionId);
    if (!session) {
      return res.status(401).json({
        message: "Session expired or revoked. Please log in again.",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      sessionId: decoded.sessionId,
    };

    // console.log(req.user);

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = requireAuth;

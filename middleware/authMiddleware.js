const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = requireAuth;

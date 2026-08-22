
const getTokenFromRequest = (req) => {
  let token = req.cookies?.jwt;

  // Fallback to Authorization header if cookie is missing
  // if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
  //   token = req.headers.authorization.split(" ")[1];
  // }

  return token || null;
};

module.exports = {
  getTokenFromRequest,
};

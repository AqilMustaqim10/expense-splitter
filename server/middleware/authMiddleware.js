const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Protect Middleware ────────────────────────────────────────────────────────
// Attaches to any route that requires the user to be logged in
// Checks the request header for a valid JWT token
const protect = async (req, res, next) => {
  let token;

  // JWT tokens are sent in the Authorization header as: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token (remove "Bearer " prefix)
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user object to the request (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Token is valid — proceed to the next handler
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };

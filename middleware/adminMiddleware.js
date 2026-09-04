const adminMiddleware = (req, res, next) => {

  // Check if user is logged in
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  // Check admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  next();
};

module.exports = adminMiddleware;
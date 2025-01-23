// authorizeRole.js
const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: Insufficient Role" });
    }
    next();
  };
};

module.exports = authorizeRole;

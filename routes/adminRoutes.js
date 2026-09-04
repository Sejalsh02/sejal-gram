const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  getAllPosts,
  deleteUser,
  deletePost,
  getStats,
} = require("../controllers/adminController");

// All routes below require:
// 1. Valid JWT
// 2. Admin role

router.use(authMiddleware);
router.use(adminMiddleware);

// Get statistics
router.get("/stats", getStats);

// Get all users
router.get("/users", getAllUsers);

// Get all posts
router.get("/posts", getAllPosts);

// Delete user
router.delete("/users/:id", deleteUser);

// Delete post
router.delete("/posts/:id", deletePost);

module.exports = router;
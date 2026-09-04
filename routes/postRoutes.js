const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/postController");

// ==========================================
// GET ALL POSTS
// ==========================================
router.get("/", getPosts);

// ==========================================
// GET SINGLE POST
// ==========================================
router.get("/:id", getPostById);

// ==========================================
// CREATE POST WITH IMAGE
// ==========================================
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createPost
);

// ==========================================
// UPDATE POST WITH OPTIONAL IMAGE
// ==========================================
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  updatePost
);

// ==========================================
// LIKE / UNLIKE POST
// ==========================================
router.put(
  "/:id/like",
  authMiddleware,
  likePost
);

// ==========================================
// DELETE POST
// ==========================================
router.delete(
  "/:id",
  authMiddleware,
  deletePost
);

module.exports = router;
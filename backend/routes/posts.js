const express = require("express");
const router = express.Router();
const { getDb, saveDb } = require("../db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const multer = require("multer");
const path = require("path");

// Configure Image Storage
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 1. Get all posts (Public)
router.get("/", (req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT p.*, u.name as author, u.profile_pic, u.role as author_role
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.id DESC
    `);

    if (result.length === 0) return res.json([]);

    const cols = result[0].columns;
    const rows = result[0].values.map(row => {
      const obj = {};
      cols.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Create Post (With Image)
router.post("/", auth, upload.single("image"), (req, res) => {
  const { content, tag } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!content && !imageUrl) return res.status(400).json({ error: "Content or image required" });

  try {
    const db = getDb();
    db.run(
      "INSERT INTO posts (user_id, content, tag, image_url) VALUES (?, ?, ?, ?)",
      [req.user.userId, content, tag || null, imageUrl]
    );
    saveDb();

    const result = db.exec("SELECT last_insert_rowid() as id");
    const postId = result[0].values[0][0];
    res.json({ message: "Post created", postId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. Toggle Like
router.post("/:postId/like", auth, (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;

  try {
    const db = getDb();
    const existing = db.exec("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId]);

    if (existing.length > 0 && existing[0].values.length > 0) {
      db.run("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId]);
      saveDb();
      res.json({ liked: false });
    } else {
      db.run("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [userId, postId]);
      saveDb();
      res.json({ liked: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 4. Get Likes Count
router.get("/:postId/likes", (req, res) => {
  try {
    const db = getDb();
    const result = db.exec("SELECT COUNT(*) as count FROM likes WHERE post_id = ?", [req.params.postId]);
    const count = result.length > 0 ? result[0].values[0][0] : 0;
    res.json({ count });
  } catch (e) {
    res.json({ count: 0 });
  }
});

// 5. Delete Post (admin only)
router.delete("/:postId", auth, admin, (req, res) => {
  const postId = req.params.postId;
  try {
    const db = getDb();
    db.run("DELETE FROM comments WHERE post_id = ?", [postId]);
    db.run("DELETE FROM likes WHERE post_id = ?", [postId]);
    db.run("DELETE FROM posts WHERE id = ?", [postId]);
    saveDb();
    res.json({ success: true, message: "Post deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
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
  const sql = `
    SELECT p.*, u.name as author, u.profile_pic 
    FROM posts p 
    LEFT JOIN users u ON p.user_id = u.id 
    ORDER BY p.id DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Create Post (With Image)
router.post("/", auth, upload.single("image"), (req, res) => {
  const { content, tag } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!content && !imageUrl) return res.status(400).json({ error: "Content or image required" });

  db.run(
    `INSERT INTO posts (user_id, content, tag, image_url) VALUES (?, ?, ?, ?)`,
    [req.user.userId, content, tag || null, imageUrl],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Post created", postId: this.lastID });
    }
  );
});

// 3. Toggle Like (Fixed Logic)
router.post("/:postId/like", auth, (req, res) => {
    const userId = req.user.userId; // NOW USES REAL LOGGED IN USER
    const postId = req.params.postId;

    db.get("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId], (err, row) => {
        if (row) {
            db.run("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId], () => res.json({ liked: false }));
        } else {
            db.run("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [userId, postId], () => res.json({ liked: true }));
        }
    });
});

// 4. Get Likes Count
router.get("/:postId/likes", (req, res) => {
    db.get("SELECT COUNT(*) as count FROM likes WHERE post_id = ?", [req.params.postId], (err, row) => {
        res.json({ count: row ? row.count : 0 });
    });
});

module.exports = router;



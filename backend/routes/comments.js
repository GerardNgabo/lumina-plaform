const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Add comment (protected)
router.post("/", auth, (req, res) => {
  const { post_id, comment } = req.body;
  if (!post_id || !comment) return res.status(400).json({ error: "Missing required fields" });

  db.run(`INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)`,
    [post_id, req.user.userId, comment],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Comment added", commentId: this.lastID });
    });
});

// Get comments for a post (public)
router.get("/:post_id", (req, res) => {
  const { post_id } = req.params;
  db.all(
    `SELECT comments.*, users.name as user_name 
     FROM comments 
     JOIN users ON users.id = comments.user_id 
     WHERE post_id = ? ORDER BY created_at ASC`,
    [post_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;


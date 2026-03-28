const express = require("express");
const router = express.Router();
const { getDb, saveDb } = require("../db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Add comment (protected)
router.post("/", auth, (req, res) => {
  const { post_id, comment } = req.body;
  if (!post_id || !comment) return res.status(400).json({ error: "Missing required fields" });

  try {
    const db = getDb();
    db.run("INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)",
      [post_id, req.user.userId, comment]);
    saveDb();

    const result = db.exec("SELECT last_insert_rowid() as id");
    const commentId = result[0].values[0][0];
    res.json({ message: "Comment added", commentId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get comments for a post (public)
router.get("/:post_id", (req, res) => {
  const { post_id } = req.params;

  try {
    const db = getDb();
    const result = db.exec(
      `SELECT comments.*, users.name as user_name
       FROM comments
       JOIN users ON users.id = comments.user_id
       WHERE post_id = ? ORDER BY created_at ASC`,
      [post_id]
    );

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

// Delete comment (admin only)
router.delete("/:id", auth, admin, (req, res) => {
  try {
    const db = getDb();
    db.run("DELETE FROM comments WHERE id = ?", [req.params.id]);
    saveDb();
    res.json({ success: true, message: "Comment deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

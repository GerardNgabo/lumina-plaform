const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb, saveDb } = require("../db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

  try {
    const db = getDb();
    const existing = db.exec("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hash]);
    saveDb();

    const result = db.exec("SELECT last_insert_rowid() as id");
    const userId = result[0].values[0][0];
    res.json({ message: "User registered", userId });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to register" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const db = getDb();
    const result = db.exec("SELECT * FROM users WHERE email = ?", [email]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const cols = result[0].columns;
    const row = result[0].values[0];
    const user = {};
    cols.forEach((col, i) => { user[col] = row[i]; });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email, role: user.role || "user" },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role || "user" }
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Login failed" });
  }
});

// Update Profile Name
router.put("/update", auth, (req, res) => {
  const { name, newName } = req.body;
  const displayName = newName || name;
  if (!displayName) return res.status(400).json({ error: "Name required" });

  try {
    const db = getDb();
    db.run("UPDATE users SET name = ? WHERE id = ?", [displayName, req.user.userId]);
    saveDb();
    res.json({ success: true, newName: displayName });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (admin only)
router.get("/users", auth, admin, (req, res) => {
  try {
    const db = getDb();
    const result = db.exec("SELECT id, name, email, role, profile_pic FROM users ORDER BY id ASC");
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

// Update user role (admin only)
router.put("/users/:id/role", auth, admin, (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!role || !["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Role must be 'user' or 'admin'" });
  }

  try {
    const db = getDb();
    db.run("UPDATE users SET role = ? WHERE id = ?", [role, parseInt(userId)]);
    saveDb();
    res.json({ success: true, userId: parseInt(userId), role });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete user (admin only)
router.delete("/users/:id", auth, admin, (req, res) => {
  const userId = parseInt(req.params.id);

  if (userId === req.user.userId) {
    return res.status(400).json({ error: "Cannot delete yourself" });
  }

  try {
    const db = getDb();
    db.run("DELETE FROM comments WHERE user_id = ?", [userId]);
    db.run("DELETE FROM likes WHERE user_id = ?", [userId]);
    db.run("DELETE FROM posts WHERE user_id = ?", [userId]);
    db.run("DELETE FROM users WHERE id = ?", [userId]);
    saveDb();
    res.json({ success: true, message: "User deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

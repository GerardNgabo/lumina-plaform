const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb, saveDb } = require("../db");
const auth = require("../middleware/auth");

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
      { userId: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email }
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

module.exports = router;

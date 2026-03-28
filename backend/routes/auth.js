const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const auth = require("../middleware/auth"); // <--- THIS WAS MISSING!

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// Register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

  db.get(`SELECT id FROM users WHERE email = ?`, [email], async (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    try {
      const hash = await bcrypt.hash(password, 10);
      db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, hash],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ message: "User registered", userId: this.lastID });
        });
    } catch (e) {
      res.status(500).json({ error: "Failed to register" });
    }
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

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
  });
});

// Update Profile Name
router.put("/update", auth, (req, res) => {
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ error: "Name required" });

    db.run("UPDATE users SET name = ? WHERE id = ?", [newName, req.user.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, newName });
    });
});

module.exports = router;

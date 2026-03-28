const initSqlJs = require("sql.js");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "lumina.db");

let db;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    profile_pic TEXT,
    role TEXT DEFAULT 'user'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    tag TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER,
    post_id INTEGER,
    PRIMARY KEY (user_id, post_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed default admin if no users exist
  const users = db.exec("SELECT COUNT(*) as count FROM users");
  const userCount = users[0].values[0][0];
  if (userCount === 0) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@lumina.dev", hash, "admin"]
    );
    console.log("Default admin created: admin@lumina.dev / admin123");
  }

  saveDb();
  console.log("Connected to SQLite database.");
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function getDb() {
  return db;
}

module.exports = { initDb, getDb, saveDb };
